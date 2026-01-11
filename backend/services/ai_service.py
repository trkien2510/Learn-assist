from typing import Literal, List, Optional, Tuple
from pydantic import BaseModel
from openai import OpenAI
import tiktoken
import math
import re

from core.config import settings


DEFAULT_MODEL = "gpt-5-nano"

MODEL_TOKEN_LIMITS = {
    "gpt-5-nano": 272000,
}

RESERVED_TOKENS = 4000
MIN_CONTENT_TOKENS = 100
MIN_CONTENT_WORDS = 10


class GeneratedQuestion(BaseModel):
    content: str
    options: List[str]
    answer: str
    difficulty: Literal["dễ", "trung bình", "khó"]


class QuestionGenerationResponse(BaseModel):
    questions: List[GeneratedQuestion]


class DocumentValidationResult(BaseModel):
    is_valid: bool
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    word_count: int = 0
    token_count: int = 0
    requires_chunking: bool = False
    estimated_chunks: int = 1


def count_tokens(text: str, model: str = DEFAULT_MODEL) -> int:
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))


def count_words(text: str) -> int:
    words = re.findall(r'\b\w+\b', text, re.UNICODE)
    return len(words)


def validate_document_content(
    text: str, 
    num_questions: int,
    model: str = DEFAULT_MODEL
) -> DocumentValidationResult:
    if not text or not text.strip():
        return DocumentValidationResult(
            is_valid=False,
            error_code="EMPTY_CONTENT",
            error_message="Tài liệu trống hoặc không có nội dung văn bản"
        )
    
    cleaned_text = text.strip()
    word_count = count_words(cleaned_text)
    token_count = count_tokens(cleaned_text, model)
    
    if word_count < MIN_CONTENT_WORDS:
        return DocumentValidationResult(
            is_valid=False,
            error_code="INSUFFICIENT_CONTENT",
            error_message=f"Tài liệu chỉ có {word_count} từ, cần ít nhất {MIN_CONTENT_WORDS} từ để sinh câu hỏi",
            word_count=word_count,
            token_count=token_count
        )
    
    min_words_for_questions = num_questions * 10
    if word_count < min_words_for_questions:
        recommended_questions = max(1, word_count // 10)
        return DocumentValidationResult(
            is_valid=False,
            error_code="INSUFFICIENT_FOR_QUESTIONS",
            error_message=f"Tài liệu chỉ có {word_count} từ, không đủ để sinh {num_questions} câu hỏi. Đề xuất tối đa {recommended_questions} câu hỏi",
            word_count=word_count,
            token_count=token_count
        )
    
    max_tokens = MODEL_TOKEN_LIMITS.get(model, 1000000) - RESERVED_TOKENS
    requires_chunking = token_count > max_tokens
    estimated_chunks = math.ceil(token_count / max_tokens) if requires_chunking else 1
    
    return DocumentValidationResult(
        is_valid=True,
        word_count=word_count,
        token_count=token_count,
        requires_chunking=requires_chunking,
        estimated_chunks=estimated_chunks
    )


def split_document_into_chunks(
    text: str, 
    model: str = DEFAULT_MODEL,
    overlap_sentences: int = 2
) -> List[str]:
    max_tokens = MODEL_TOKEN_LIMITS.get(model, 1000000) - RESERVED_TOKENS
    
    total_tokens = count_tokens(text, model)
    if total_tokens <= max_tokens:
        return [text]
    
    sentence_pattern = r'(?<=[.!?。！？])\s+'
    sentences = re.split(sentence_pattern, text)
    
    if len(sentences) <= 1:
        paragraphs = text.split('\n\n')
        if len(paragraphs) > 1:
            sentences = paragraphs
        else:
            sentences = text.split('\n')
    
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    for i, sentence in enumerate(sentences):
        sentence = sentence.strip()
        if not sentence:
            continue
            
        sentence_tokens = count_tokens(sentence, model)
        
        if sentence_tokens > max_tokens:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_tokens = 0
            
            words = sentence.split()
            word_chunk = []
            word_tokens = 0
            
            for word in words:
                word_token_count = count_tokens(word + ' ', model)
                if word_tokens + word_token_count > max_tokens:
                    if word_chunk:
                        chunks.append(' '.join(word_chunk))
                    word_chunk = [word]
                    word_tokens = word_token_count
                else:
                    word_chunk.append(word)
                    word_tokens += word_token_count
            
            if word_chunk:
                current_chunk = word_chunk
                current_tokens = word_tokens
            continue
        
        if current_tokens + sentence_tokens > max_tokens:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
                
                overlap_start = max(0, len(current_chunk) - overlap_sentences)
                current_chunk = current_chunk[overlap_start:]
                current_tokens = count_tokens(' '.join(current_chunk), model)
        
        current_chunk.append(sentence)
        current_tokens += sentence_tokens
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks


def call_openai_for_questions(prompt: str, model: str = DEFAULT_MODEL) -> Optional[dict]:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        completion = client.beta.chat.completions.parse(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "Bạn là chuyên gia tạo câu hỏi trắc nghiệm giáo dục chất lượng cao. "
                               "Luôn trả về câu hỏi theo đúng format được yêu cầu. "
                               "Nếu nội dung tài liệu không phù hợp để tạo câu hỏi, hãy trả về danh sách rỗng."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format=QuestionGenerationResponse
        )

        parsed_response = completion.choices[0].message.parsed
        
        if parsed_response is None:
            refusal = completion.choices[0].message.refusal
            if refusal:
                print(f"OpenAI refusal: {refusal}")
            return None

        return parsed_response.model_dump()

    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return None


def generate_questions_from_large_document(
    text: str, 
    num_questions: int,
    model: str = DEFAULT_MODEL
) -> Tuple[Optional[dict], Optional[str]]:
    validation = validate_document_content(text, num_questions, model)
    
    if not validation.is_valid:
        return None, validation.error_message
    
    if not validation.requires_chunking:
        prompt = create_question_generation_prompt(text.strip(), num_questions)
        result = call_openai_for_questions(prompt, model)
        
        if result is None:
            return None, "Không thể sinh câu hỏi từ nội dung tài liệu. Vui lòng kiểm tra lại nội dung."
        
        questions = result.get("questions", [])
        if not questions:
            return None, "Nội dung tài liệu không phù hợp để sinh câu hỏi trắc nghiệm"
        
        return {
            "questions": questions,
            "chunks_processed": 1,
            "total_tokens": validation.token_count
        }, None
    
    chunks = split_document_into_chunks(text, model)
    
    questions_per_chunk = distribute_questions_to_chunks(num_questions, len(chunks))
    
    all_questions = []
    chunks_processed = 0
    failed_chunks = 0
    
    for i, chunk in enumerate(chunks):
        if questions_per_chunk[i] == 0:
            continue
            
        prompt = create_question_generation_prompt(chunk, questions_per_chunk[i])
        result = call_openai_for_questions(prompt, model)
        
        if result and result.get("questions"):
            all_questions.extend(result["questions"])
            chunks_processed += 1
        else:
            failed_chunks += 1
    
    if not all_questions:
        return None, "Không thể sinh câu hỏi từ bất kỳ phần nào của tài liệu. Nội dung có thể không phù hợp."
    
    unique_questions = deduplicate_questions(all_questions)
    
    return {
        "questions": unique_questions,
        "chunks_processed": chunks_processed,
        "total_chunks": len(chunks),
        "failed_chunks": failed_chunks,
        "total_tokens": validation.token_count
    }, None


def distribute_questions_to_chunks(total_questions: int, num_chunks: int) -> List[int]:
    if num_chunks == 0:
        return []
    
    base_per_chunk = total_questions // num_chunks
    remainder = total_questions % num_chunks
    
    distribution = []
    for i in range(num_chunks):
        questions = base_per_chunk + (1 if i < remainder else 0)
        distribution.append(questions)
    
    return distribution


def deduplicate_questions(questions: List[dict]) -> List[dict]:
    seen_contents = set()
    unique = []
    
    for q in questions:
        content = q.get("content", "").lower().strip()
        normalized = re.sub(r'\s+', ' ', content)
        
        if normalized not in seen_contents:
            seen_contents.add(normalized)
            unique.append(q)
    
    return unique


def create_question_generation_prompt(text_chunk: str, num_questions: int) -> str:
    return f"""
Nhiệm vụ: Tạo đúng {num_questions} câu hỏi trắc nghiệm dựa trên nội dung tài liệu bên dưới.

--- NỘI DUNG TÀI LIỆU ---
{text_chunk}
--- KẾT THÚC TÀI LIỆU ---

YÊU CẦU BẮT BUỘC:
1. Mỗi câu hỏi PHẢI có đúng 4 lựa chọn (options).
2. Mỗi option PHẢI LÀ NỘI DUNG ĐÁP ÁN CỤ THỂ (không phải A, B, C, D).
3. Trường "answer" PHẢI CHỨA NỘI DUNG của đáp án đúng (copy chính xác từ một trong các options).
4. "difficulty" phải đa dạng: kết hợp cả "dễ", "trung bình", và "khó" tùy theo độ phức tạp của câu hỏi.
5. Câu hỏi phải dựa trên nội dung tài liệu, không bịa đặt thông tin.
6. Nếu nội dung không chứa đủ thông tin để tạo câu hỏi có ý nghĩa, hãy trả về ít câu hỏi hơn hoặc danh sách rỗng.

QUY TẮC VỀ VỊ TRÍ ĐÁP ÁN (RẤT QUAN TRỌNG):
- Đáp án đúng PHẢI được đặt NGẪU NHIÊN ở các vị trí khác nhau trong danh sách options.
- KHÔNG được đặt đáp án đúng luôn ở vị trí đầu tiên hoặc thứ hai.
- Phân bố đáp án đúng đều qua cả 4 vị trí: khoảng 25% ở vị trí 1, 25% ở vị trí 2, 25% ở vị trí 3, 25% ở vị trí 4.
- Với {num_questions} câu hỏi, hãy đảm bảo đáp án đúng xuất hiện ở mỗi vị trí ít nhất 1 lần nếu có thể.

LƯU Ý QUAN TRỌNG:
- Câu hỏi phải có nghĩa và người làm bài có thể trả lời mà không cần đọc nội dung tài liệu.
- Options phải là các đáp án có nghĩa, KHÔNG phải chữ cái A, B, C, D.
- Answer phải là chính xác nội dung của 1 trong 4 options.
- Phân bổ difficulty hợp lý theo độ khó thực tế của câu hỏi.
- Nếu tài liệu không rõ ràng hoặc thiếu thông tin, KHÔNG bịa đặt câu hỏi.
""".strip()

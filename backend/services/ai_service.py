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
            error_message="Document is empty or has no text content"
        )
    
    cleaned_text = text.strip()
    word_count = count_words(cleaned_text)
    token_count = count_tokens(cleaned_text, model)
    
    if word_count < MIN_CONTENT_WORDS:
        return DocumentValidationResult(
            is_valid=False,
            error_code="INSUFFICIENT_CONTENT",
            error_message=f"Document has only {word_count} words, need at least {MIN_CONTENT_WORDS} words to generate questions",
            word_count=word_count,
            token_count=token_count
        )
    
    min_words_for_questions = num_questions * 10
    if word_count < min_words_for_questions:
        recommended_questions = max(1, word_count // 10)
        return DocumentValidationResult(
            is_valid=False,
            error_code="INSUFFICIENT_FOR_QUESTIONS",
            error_message=f"Document has only {word_count} words, not enough to generate {num_questions} questions. Recommended maximum {recommended_questions} questions",
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

_document_type_cache = {}

def detect_document_type_fast(text: str) -> str:
    sample = text[:1000].lower()
    
    keyword_patterns = {
        'Pháp luật': ['điều', 'khoản', 'nghị định', 'luật', 'thông tư', 'quy định', 'quyền', 'nghĩa vụ', 'xử phạt', 'hình sự', 'dân sự', 'hợp đồng', 'bộ luật'],
        'Kỹ thuật': ['hệ thống', 'thuật toán', 'module', 'cấu trúc', 'database', 'api', 'server', 'function', 'class', 'code', 'lập trình', 'phần mềm', 'hardware', 'software'],
        'Học thuật': ['định nghĩa', 'định lý', 'chứng minh', 'công thức', 'giả thuyết', 'nghiên cứu', 'phương pháp', 'lý thuyết', 'thí nghiệm', 'kết luận', 'tham khảo'],
        'Văn học': ['nhân vật', 'tác giả', 'tác phẩm', 'thơ', 'truyện', 'tiểu thuyết', 'nghệ thuật', 'hình tượng', 'biểu cảm', 'cảm xúc', 'văn xuôi'],
        'Báo chí': ['phóng viên', 'thông tin', 'sự kiện', 'ngày', 'tháng', 'năm', 'theo', 'cho biết', 'được biết', 'nguồn tin', 'hôm nay']
    }
    
    scores = {}
    for doc_type, keywords in keyword_patterns.items():
        score = sum(1 for kw in keywords if kw in sample)
        scores[doc_type] = score
    
    max_score = max(scores.values())
    if max_score >= 2:
        return max(scores, key=scores.get)
    
    return "Chung"


def detect_document_type(text: str, model: str = DEFAULT_MODEL) -> str:
    fast_result = detect_document_type_fast(text)
    if fast_result != "Chung":
        return fast_result
    
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    sample_text = text[:500]
    
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "Phân loại văn bản: 'Học thuật', 'Kỹ thuật', 'Pháp luật', 'Văn học', 'Báo chí', hoặc 'Chung'. Chỉ trả về tên loại."
                },
                {
                    "role": "user",
                    "content": sample_text
                }
            ],
            max_completion_tokens=20
        )
        
        doc_type = completion.choices[0].message.content.strip()
        valid_types = ['Học thuật', 'Kỹ thuật', 'Pháp luật', 'Văn học', 'Báo chí']
        
        for v_type in valid_types:
            if v_type.lower() in doc_type.lower():
                return v_type
                
        return "Chung"
    except Exception as e:
        print(f"Error detecting document type: {e}")
        return "Chung"


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
    
    doc_type = detect_document_type(text, model)
    
    if not validation.requires_chunking:
        prompt = create_question_generation_prompt(text.strip(), num_questions, doc_type)
        result = call_openai_for_questions(prompt, model)
        
        if result is None:
            return None, "Cannot generate questions from document content. Please check the content again."
        
        questions = result.get("questions", [])
        if not questions:
            return None, "Document content is not suitable for generating multiple choice questions"
        
        return {
            "questions": questions,
            "chunks_processed": 1,
            "total_tokens": validation.token_count,
            "doc_type": doc_type
        }, None
    
    chunks = split_document_into_chunks(text, model)
    
    questions_per_chunk = distribute_questions_to_chunks(num_questions, len(chunks))
    
    all_questions = []
    chunks_processed = 0
    failed_chunks = 0
    
    for i, chunk in enumerate(chunks):
        if questions_per_chunk[i] == 0:
            continue
            
        prompt = create_question_generation_prompt(chunk, questions_per_chunk[i], doc_type)
        result = call_openai_for_questions(prompt, model)
        
        if result and result.get("questions"):
            all_questions.extend(result["questions"])
            chunks_processed += 1
        else:
            failed_chunks += 1
    
    if not all_questions:
        return None, "Cannot generate questions from any part of the document. Content may be unsuitable."
    
    unique_questions = deduplicate_questions(all_questions)
    
    return {
        "questions": unique_questions,
        "chunks_processed": chunks_processed,
        "total_chunks": len(chunks),
        "failed_chunks": failed_chunks,
        "total_tokens": validation.token_count,
        "doc_type": doc_type
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


def create_question_generation_prompt(text_chunk: str, num_questions: int, doc_type: str = "Chung") -> str:
    type_specific_instructions = {
        "Học thuật": "Tập trung vào kiến thức nền tảng, các định nghĩa, định lý, hệ quả và các mối quan hệ logic trong văn bản. Đảm bảo câu hỏi có tính chất kiểm tra sự hiểu biết sâu sắc.",
        "Kỹ thuật": "Tập trung vào các thông số kỹ thuật, quy trình thực hiện, nguyên lý vận hành và các bước giải quyết vấn đề. Câu hỏi nên có tính thực tiễn cao.",
        "Pháp luật": "Tập trung vào các điều khoản, quyền lợi, nghĩa vụ, thời hạn và các quy định cụ thể. Cần sự chính xác tuyệt đối về thuật ngữ pháp lý.",
        "Văn học": "Tập trung vào các biện pháp nghệ thuật, nội dung tư tưởng, hình tượng nhân vật và ý nghĩa của các chi tiết nghệ thuật. Phân loại độ khó dựa trên khả năng cảm thụ.",
        "Báo chí": "Tập trung vào các sự kiện then chốt, nhân vật liên quan, thời gian, địa điểm và nguyên nhân của sự việc (mô hình 5W1H).",
        "Chung": "Tạo các câu hỏi bao quát nội dung chính của tài liệu, phân bổ đều kiến thức."
    }
    
    instruction = type_specific_instructions.get(doc_type, type_specific_instructions["Chung"])

    return f"""
Nhiệm vụ: Tạo đúng {num_questions} câu hỏi trắc nghiệm dựa trên nội dung tài liệu bên dưới.
Loại tài liệu được nhận diện: {doc_type}

HƯỚNG DẪN CHUYÊN BIỆT: {instruction}

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

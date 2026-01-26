from typing import Literal, List, Optional, Tuple
from pydantic import BaseModel
from openai import AsyncOpenAI
import tiktoken
import math
import re
import asyncio

from core.config import settings

DEFAULT_MODEL = "gpt-4o-mini"
CONTEXT_WINDOW = 128000
MAX_OUTPUT_LIMIT = 16384
RESERVED_TOKENS = 17500 
MAX_QUESTIONS = 50


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


def count_tokens(text: str) -> int:
    try:
        encoding = tiktoken.encoding_for_model(DEFAULT_MODEL)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def count_words(text: str) -> int:
    return len(re.findall(r'\b\w+\b', text, re.UNICODE))

def validate_document_content(text: str, num_questions: int) -> DocumentValidationResult:
    if not text or not text.strip():
        return DocumentValidationResult(is_valid=False, error_code="EMPTY", error_message="Tài liệu trống")
    
    cleaned_text = text.strip()
    word_count = count_words(cleaned_text)
    token_count = count_tokens(cleaned_text)
    
    if num_questions > MAX_QUESTIONS:
        return DocumentValidationResult(
            is_valid=False,
            error_code="TOO_MANY_QUESTIONS",
            error_message=f"Số lượng câu hỏi vượt quá giới hạn (Tối đa {MAX_QUESTIONS} câu).",
            word_count=word_count,
            token_count=token_count
        )
    
    max_tokens_for_input = CONTEXT_WINDOW - RESERVED_TOKENS
    requires_chunking = token_count > max_tokens_for_input
    estimated_chunks = math.ceil(token_count / max_tokens_for_input) if requires_chunking else 1
    
    return DocumentValidationResult(
        is_valid=True,
        word_count=word_count,
        token_count=token_count,
        requires_chunking=requires_chunking,
        estimated_chunks=estimated_chunks
    )

def split_document_into_chunks(text: str) -> List[str]:
    max_tokens = CONTEXT_WINDOW - RESERVED_TOKENS
    if count_tokens(text) <= max_tokens:
        return [text]
    
    sentences = re.split(r'(?<=[.!?。！？])\s+', text)
    chunks, current_chunk, current_tokens = [], [], 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence: continue
        
        sent_tokens = count_tokens(sentence)
        
        if sent_tokens > max_tokens:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk, current_tokens = [], 0
            words = sentence.split()
            temp_c, temp_t = [], 0
            for w in words:
                wt = count_tokens(w + ' ')
                if temp_t + wt > max_tokens:
                    chunks.append(' '.join(temp_c))
                    temp_c, temp_t = [w], wt
                else:
                    temp_c.append(w)
                    temp_t += wt
            if temp_c:
                current_chunk, current_tokens = temp_c, temp_t
            continue

        if current_tokens + sent_tokens > max_tokens:
            chunks.append(' '.join(current_chunk))
            current_chunk, current_tokens = [], 0
        
        current_chunk.append(sentence)
        current_tokens += sent_tokens
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    return chunks


DOCUMENT_KEYWORDS = {
    'Công nghệ': ['hệ thống', 'thuật toán', 'phần mềm', 'dữ liệu', 'mạng', 'lập trình', 'ai', 'cloud', 'database'],
    'Y tế': ['bệnh', 'điều trị', 'thuốc', 'triệu chứng', 'y khoa', 'bác sĩ', 'vắc xin', 'sức khỏe'],
    'Pháp luật': ['điều', 'khoản', 'nghị định', 'luật', 'thông tư', 'quy định', 'tòa án', 'vi phạm'],
    'Kinh tế': ['thị trường', 'lợi nhuận', 'doanh nghiệp', 'tài chính', 'ngân hàng', 'đầu tư', 'lạm phát'],
    'Lịch sử - Địa lý': ['thế kỷ', 'năm', 'sự kiện', 'văn hóa', 'quốc gia', 'địa danh', 'lịch sử', 'khí hậu'],
    'Văn học': ['nhân vật', 'tác giả', 'tác phẩm', 'nghệ thuật', 'thơ', 'truyện', 'tiểu thuyết'],
    'Toán học': ['toán', 'số học', 'hình học', 'đại số', 'bảng cửu chương', 'phép tính', 'phương trình', 'bài toán']
}

TYPE_HINTS = {
    "Công nghệ": "Tập trung vào logic, quy trình và thông số. CÓ THỂ sử dụng kiến thức chuyên môn bên ngoài để làm phong phú câu hỏi nếu tài liệu chưa đủ chi tiết.",
    "Y tế": "YÊU CẦU CHÍNH XÁC TUYỆT ĐỐI. Chỉ đặt câu hỏi dựa trên các sự thật y khoa có trong tài liệu, KHÔNG tự ý suy diễn hoặc thêm kiến thức ngoài.",
    "Pháp luật": "YÊU CẦU BÁM SÁT VĂN BẢN. Mọi câu hỏi và đáp án phải căn cứ trực tiếp vào các điều khoản, quy định trong tài liệu tải lên.",
    "Kinh tế": "Tập trung vào các nguyên lý và chỉ số. CÓ THỂ mở rộng thêm các tình huống thực tế liên quan đến chuyên môn kinh tế để tăng tính ứng dụng.",
    "Lịch sử - Địa lý": "BÁM SÁT DỮ KIỆN. Tập trung vào các mốc thời gian, địa điểm và sự kiện cụ thể có trong tài liệu.",
    "Văn học": "CÓ THỂ sáng tạo. Tập trung vào cảm thụ, tâm lý và phong cách, có thể kết nối với các kiến thức văn học liên quan để câu hỏi sâu sắc hơn.",
    "Toán học": "CÓ THỂ MỞ RỘNG. Nếu tài liệu nhắc đến một chủ đề toán học, hãy sử dụng toàn bộ quy tắc và kiến thức toán học của chủ đề đó để sinh câu hỏi.",
    "Chung": "Bám sát các ý chính và thông tin quan trọng trong văn bản tải lên."
}

def detect_document_type(text: str, filename: str = None) -> str:
    sample = (filename or "") + " " + text[:3000].lower()
    scores = {dtype: sum(1 for kw in kws if kw in sample.lower()) for dtype, kws in DOCUMENT_KEYWORDS.items()}
    max_score = max(scores.values())
    return max(scores, key=scores.get) if max_score >= 1 else "Chung"

def create_specialized_prompt(text: str, num_questions: int, doc_type: str = "Chung") -> str:
    hint = TYPE_HINTS.get(doc_type, TYPE_HINTS["Chung"])
    return f"""Tạo {num_questions} câu hỏi trắc nghiệm từ tài liệu thuộc lĩnh vực [{doc_type}].
Yêu cầu chuyên môn: {hint}

---
[TÀI LIỆU]
{text}
[/TÀI LIỆU]
---

QUY TẮC BẮT BUỘC (PHẢI TUÂN THỦ):
• PHẢI TẠO ĐỦ CHÍNH XÁC {num_questions} CÂU HỎI. Không được thiếu dù chỉ 1 câu.
• MỌI câu hỏi phải dựa trên nội dung, khái niệm hoặc dữ kiện CÓ TRONG tài liệu.
• KHÔNG được tạo câu hỏi về nội dung mà tài liệu không đề cập.
• Đáp án:
  + Phải xuất hiện trực tiếp trong tài liệu,
  + HOẶC là kết quả suy luận hợp lý từ thông tin trong tài liệu, NHƯNG CHỈ KHI "Yêu cầu chuyên môn" cho phép rõ ràng.
• Nếu việc tạo câu hỏi yêu cầu suy diễn vượt quá tài liệu → KHÔNG tạo câu hỏi đó.

YÊU CẦU ĐỊNH DẠNG:
1. Mỗi câu có 4 lựa chọn (ghi rõ nội dung cụ thể).
2. 'answer' là nội dung COPPY CHÍNH XÁC của 1 lựa chọn đúng.
3. 'difficulty' ngẫu nhiên: "dễ", "trung bình", "khó".
4. Phải đảm bảo các câu hỏi không bị trùng lặp nội dung với nhau.
"""

async def call_openai_fast(prompt: str, num_questions: int) -> Optional[dict]:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    dynamic_max_tokens = min(num_questions * 400, MAX_OUTPUT_LIMIT)
    
    try:
        completion = await client.beta.chat.completions.parse(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "Bạn là chuyên gia tạo câu hỏi trắc nghiệm giáo dục chất lượng cao."},
                {"role": "user", "content": prompt}
            ],
            response_format=QuestionGenerationResponse,
            temperature=0.4,
            max_tokens=dynamic_max_tokens
        )
        parsed = completion.choices[0].message.parsed
        return parsed.model_dump() if parsed else None
    except Exception as e:
        print(f"AI Error: {e}")
        return None

def deduplicate_questions(questions: List[dict]) -> List[dict]:
    seen_content = set()
    unique_questions = []
    for q in questions:
        clean_content = re.sub(r'\s+', '', q['content'].lower())
        if clean_content not in seen_content:
            seen_content.add(clean_content)
            unique_questions.append(q)
    return unique_questions

async def generate_questions(
    text: str, 
    num_questions: int,
    model: str = None,
    filename: str = None
) -> Tuple[Optional[dict], Optional[str]]:
    
    validation = validate_document_content(text, num_questions)
    if not validation.is_valid:
        return None, validation.error_message
    
    doc_type = detect_document_type(text, filename)
    all_questions = []
    max_retries = 3
    retry_count = 0

    while len(all_questions) < num_questions and retry_count < max_retries:
        remaining_needed = num_questions - len(all_questions)
        
        if not validation.requires_chunking:
            extra_context = ""
            if all_questions:
                existing_qs = "\n".join([f"- {q['content']}" for q in all_questions[-10:]])
                extra_context = f"\nLƯU Ý: Đã có các câu hỏi sau, hãy tạo các câu khác hoàn toàn:\n{existing_qs}"
            
            prompt = create_specialized_prompt(text.strip(), remaining_needed, doc_type) + extra_context
            result = await call_openai_fast(prompt, remaining_needed)
            new_qs = result.get("questions", []) if result else []
            all_questions.extend(new_qs)
        else:
            chunks = split_document_into_chunks(text)
            q_per_chunk = remaining_needed // len(chunks)
            rem = remaining_needed % len(chunks)
            
            tasks = []
            for i in range(len(chunks)):
                count = q_per_chunk + (1 if i < rem else 0)
                if count > 0:
                    prompt = create_specialized_prompt(chunks[i], count, doc_type)
                    tasks.append(call_openai_fast(prompt, count))
            
            results = await asyncio.gather(*tasks)
            for res in results:
                if res and res.get("questions"):
                    all_questions.extend(res["questions"])
        
        all_questions = deduplicate_questions(all_questions)
        retry_count += 1

    return {
        "questions": all_questions[:num_questions],
        "chunks_processed": 1 if not validation.requires_chunking else len(split_document_into_chunks(text)),
        "total_tokens": validation.token_count,
        "doc_type": doc_type,
        "model": DEFAULT_MODEL
    }, None

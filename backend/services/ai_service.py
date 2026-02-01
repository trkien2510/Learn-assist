from typing import Literal, List, Optional, Tuple
from pydantic import BaseModel
from openai import AsyncOpenAI
from enum import Enum
import tiktoken
import math
import re
import asyncio

from core.config import settings
from core.exception_handler import AppException
from core.status_code import StatusCode
from services import log_service
import openai

DEFAULT_MODEL = "gpt-4o-mini"
CONTEXT_WINDOW = 128000
MAX_OUTPUT_LIMIT = 16384
RESERVED_TOKENS = 17500 
MAX_QUESTIONS = 50


class GenerationMode(str, Enum):
    STRICT = "strict"
    EXPANDED = "expanded"


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
        return DocumentValidationResult(is_valid=False, error_code="EMPTY", error_message="Document is empty")
    
    cleaned_text = text.strip()
    word_count = count_words(cleaned_text)
    token_count = count_tokens(cleaned_text)
    
    if num_questions > MAX_QUESTIONS:
        return DocumentValidationResult(
            is_valid=False,
            error_code="TOO_MANY_QUESTIONS",
            error_message=f"Number of questions exceeds limit (Maximum {MAX_QUESTIONS} questions).",
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


def create_prompt(text: str, num_questions: int, mode: GenerationMode) -> str:
    if mode == GenerationMode.STRICT:
        mode_desc = "BÁM SÁT: Chỉ dùng thông tin CÓ TRONG tài liệu. KHÔNG thêm kiến thức ngoài."
    else:
        mode_desc = """MỞ RỘNG: Câu hỏi PHẢI dựa trên chủ đề/khái niệm trong tài liệu.
Có thể bổ sung kiến thức liên quan TRỰC TIẾP đến nội dung tài liệu.
KHÔNG tạo câu hỏi về chủ đề không được đề cập."""
    
    return f"""Tạo {num_questions} câu trắc nghiệm.
Chế độ: {mode_desc}

[NỘI DUNG]
{text}
[/NỘI DUNG]

Yêu cầu:
• {num_questions} câu, mỗi câu 4 đáp án
• 'answer' = nội dung chính xác của đáp án đúng
• 'difficulty': "dễ"|"trung bình"|"khó"
• Câu hỏi phải liên quan đến nội dung tài liệu
• Không trùng lặp, không mơ hồ
• Nếu không đủ nội dung → {{"questions": []}}
"""

async def call_openai_fast(prompt: str, num_questions: int, user=None) -> Optional[dict]:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    dynamic_max_tokens = min(num_questions * 400, MAX_OUTPUT_LIMIT)
    
    try:
        completion = await client.beta.chat.completions.parse(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "Chuyên gia tạo câu trắc nghiệm."},
                {"role": "user", "content": prompt}
            ],
            response_format=QuestionGenerationResponse,
            temperature=0.4,
            max_tokens=dynamic_max_tokens
        )
        parsed = completion.choices[0].message.parsed
        return parsed.model_dump() if parsed else None
    except openai.AuthenticationError as e:
        error_msg = f"AI Authentication Error (Invalid API Key): {str(e)}"
        await log_service.create_log(
            action="ai_generation_error",
            user=user,
            details={"error": error_msg, "type": "AuthenticationError"},
            status="error"
        )
        raise AppException(StatusCode.AI_GENERATION_FAILED, "AI service authentication failed. Please check system configuration.")
        
    except openai.RateLimitError as e:
        error_msg = f"AI Rate Limit/Token Exhausted: {str(e)}"
        await log_service.create_log(
            action="ai_generation_error",
            user=user,
            details={"error": error_msg, "type": "RateLimitError"},
            status="error"
        )
        raise AppException(StatusCode.AI_GENERATION_FAILED, "AI service rate limit reached or quota exhausted. Please try again later.")

    except openai.APIConnectionError as e:
        error_msg = f"AI Connection Error: {str(e)}"
        await log_service.create_log(
            action="ai_generation_error",
            user=user,
            details={"error": error_msg, "type": "APIConnectionError"},
            status="error"
        )
        raise AppException(StatusCode.AI_GENERATION_FAILED, "Could not connect to AI service. Please try again later.")

    except openai.APIError as e:
        error_msg = f"AI API Error: {str(e)}"
        await log_service.create_log(
            action="ai_generation_error",
            user=user,
            details={"error": error_msg, "type": "APIError"},
            status="error"
        )
        raise AppException(StatusCode.AI_GENERATION_FAILED, "AI service encountered an internal error. Please try again later.")

    except Exception as e:
        error_msg = f"AI Unexpected Error: {str(e)}"
        await log_service.create_log(
            action="ai_generation_error",
            user=user,
            details={"error": error_msg, "type": type(e).__name__},
            status="error"
        )
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

def validate_questions(questions: List[dict]) -> List[dict]:
    valid_questions = []
    for q in questions:
        if not q.get('content') or not q.get('options') or not q.get('answer'):
            continue
        if len(q['options']) != 4:
            continue
        if q['answer'] not in q['options']:
            continue
        valid_questions.append(q)
    return valid_questions


async def generate_questions(
    text: str, 
    num_questions: int,
    mode: GenerationMode,
    user=None
) -> Tuple[Optional[dict], Optional[str]]:
    validation = validate_document_content(text, num_questions)
    if not validation.is_valid:
        return None, validation.error_message
    
    all_questions = []
    max_retries = 3
    retry_count = 0
    empty_responses = 0

    while len(all_questions) < num_questions and retry_count < max_retries:
        remaining_needed = num_questions - len(all_questions)
        
        if not validation.requires_chunking:
            extra_context = ""
            if all_questions:
                existing_qs = "\n".join([f"- {q['content']}" for q in all_questions[-5:]])
                extra_context = f"\nTránh trùng:\n{existing_qs}"
            
            prompt = create_prompt(text.strip(), remaining_needed, mode) + extra_context
            result = await call_openai_fast(prompt, remaining_needed, user)
            new_qs = result.get("questions", []) if result else []
            
            if not new_qs:
                empty_responses += 1
                if empty_responses >= 2:
                    break
            
            new_qs = validate_questions(new_qs)
            all_questions.extend(new_qs)
        else:
            chunks = split_document_into_chunks(text)
            q_per_chunk = remaining_needed // len(chunks)
            rem = remaining_needed % len(chunks)
            
            tasks = []
            for i in range(len(chunks)):
                count = q_per_chunk + (1 if i < rem else 0)
                if count > 0:
                    prompt = create_prompt(chunks[i], count, mode)
                    tasks.append(call_openai_fast(prompt, count, user))
            
            results = await asyncio.gather(*tasks)
            chunk_empty = 0
            for res in results:
                if res and res.get("questions"):
                    validated_qs = validate_questions(res["questions"])
                    all_questions.extend(validated_qs)
                else:
                    chunk_empty += 1
            
            if chunk_empty == len(results):
                empty_responses += 1
                if empty_responses >= 2:
                    break
        
        all_questions = deduplicate_questions(all_questions)
        retry_count += 1

    if not all_questions:
        return {
            "questions": [],
            "chunks_processed": 1 if not validation.requires_chunking else len(split_document_into_chunks(text)),
            "total_tokens": validation.token_count,
            "model": DEFAULT_MODEL,
            "reason": "Document content is not suitable for generating quiz questions."
        }, None

    return {
        "questions": all_questions[:num_questions],
        "chunks_processed": 1 if not validation.requires_chunking else len(split_document_into_chunks(text)),
        "total_tokens": validation.token_count,
        "model": DEFAULT_MODEL,
        "generation_mode": mode.value
    }, None

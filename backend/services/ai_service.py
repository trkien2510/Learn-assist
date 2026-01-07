from typing import Literal, List, Optional
from pydantic import BaseModel
from openai import OpenAI

from core.config import settings

class GeneratedQuestion(BaseModel):
    content: str
    options: List[str]
    answer: str
    difficulty: Literal["dễ", "trung bình", "khó"]


class QuestionGenerationResponse(BaseModel):
    questions: List[GeneratedQuestion]


def call_openai_for_questions(prompt: str) -> Optional[dict]:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Bạn là chuyên gia tạo câu hỏi trắc nghiệm giáo dục chất lượng cao. "
                               "Luôn trả về câu hỏi theo đúng format được yêu cầu."
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
        return None


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

LƯU Ý QUAN TRỌNG:
- Options phải là các đáp án có nghĩa, KHÔNG phải chữ cái A, B, C, D.
- Answer phải là chính xác nội dung của 1 trong 4 options.
- Phân bổ difficulty hợp lý theo độ khó thực tế của câu hỏi.
""".strip()

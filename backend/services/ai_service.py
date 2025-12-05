import json
from openai import OpenAI

from core.config import settings

def call_openai_for_questions(prompt: str):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        response = client.responses.create(
            model="gpt-5-nano",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": prompt}
                    ]
                }
            ]
        )

        json_text = response.output_text

        return json.loads(json_text)

    except Exception as e:
        print(f"Lỗi gọi OpenAI hoặc JSON parse: {e}")
        return None

def create_question_generation_prompt(text_chunk: str, num_questions: int) -> str:
    example_json = {
        "questions": [
            {
                "content": "Câu hỏi mẫu",
                "options": ["A", "B", "C", "D"],
                "answer": "A",
                "difficulty": "dễ"
            }
        ]
    }

    return f"""
Bạn là chuyên gia tạo câu hỏi trắc nghiệm.

Tạo đúng {num_questions} câu hỏi dựa trên nội dung sau:

--- Tài liệu ---
{text_chunk}
---

YÊU CẦU:
- Trả về duy nhất JSON.
- Không trả lời thêm chữ nào ngoài JSON.
- Theo đúng cấu trúc ví dụ dưới đây.
- 'answer' phải nằm trong 'options'.
- difficulty: 'dễ', 'trung bình', hoặc 'khó'.

Ví dụ JSON:
{json.dumps(example_json, indent=2)}
""".strip()

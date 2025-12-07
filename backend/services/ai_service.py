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
                "content": "Thủ đô của Việt Nam là thành phố nào?",
                "options": [
                    "Thành phố Hồ Chí Minh",
                    "Hà Nội",
                    "Đà Nẵng",
                    "Cần Thơ"
                ],
                "answer": "Hà Nội",
                "difficulty": "dễ"
            },
            {
                "content": "Năm 1945 có sự kiện lịch sử quan trọng nào?",
                "options": [
                    "Cách mạng tháng Tám thành công",
                    "Chiến thắng Điện Biên Phủ",
                    "Giải phóng miền Nam",
                    "Đổi mới kinh tế"
                ],
                "answer": "Cách mạng tháng Tám thành công",
                "difficulty": "trung bình"
            }
        ]
    }

    return f"""
Bạn là chuyên gia tạo câu hỏi trắc nghiệm giáo dục chất lượng cao.

Nhiệm vụ: Tạo đúng {num_questions} câu hỏi trắc nghiệm dựa trên nội dung tài liệu bên dưới.

--- NỘI DUNG TÀI LIỆU ---
{text_chunk}
--- KẾT THÚC TÀI LIỆU ---

YÊU CẦU BẮT BUỘC:
1. Trả về DUY NHẤT JSON, không có bất kỳ text nào khác.
2. Mỗi câu hỏi PHẢI có đúng 4 lựa chọn (options).
3. Mỗi option PHẢI LÀ NỘI DUNG ĐÁP ÁN CỤ THỂ (không phải A, B, C, D).
4. Trường "answer" PHẢI CHỨA NỘI DUNG của đáp án đúng (copy chính xác từ một trong các options).
5. "difficulty" phải đa dạng: kết hợp cả "dễ", "trung bình", và "khó" tùy theo độ phức tạp của câu hỏi.
6. Câu hỏi phải dựa trên nội dung tài liệu, không bịa đặt thông tin.

CẤU TRÚC JSON MẪU (CHỈ THAM KHẢO FORMAT, KHÔNG COPY NỘI DUNG):
{json.dumps(example_json, ensure_ascii=False, indent=2)}

LƯU Ý QUAN TRỌNG:
- Options phải là các đáp án có nghĩa, KHÔNG phải chữ cái A, B, C, D.
- Answer phải là chính xác nội dung của 1 trong 4 options.
- Phân bổ difficulty hợp lý theo độ khó thực tế của câu hỏi.
""".strip()

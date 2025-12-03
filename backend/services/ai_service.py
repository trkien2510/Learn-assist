import json
from openai import OpenAI


def call_openai_for_questions(prompt: str):
    client = OpenAI()
    try:
        response = client.responses.create(
            model="gpt-5-nano",
            input="",
            response_format={"type": "json_object"}
        )

        json_string = response.choices[0].message.content.strip()

        data = json.loads(json_string)

        return data

    except Exception as e:
        print(f"Lỗi gọi OpenAI hoặc JSON parse: {e}")
        return None

def create_question_generation_prompt(text_chunk: str, num_questions: int, difficulty: str) -> str:
    json_format_example = {
        "questions": [
            {
                "content": "Câu hỏi số 1 dựa trên đoạn văn bản là gì?",
                "options": [
                    "Lựa chọn A",
                    "Lựa chọn B",
                    "Lựa chọn C",
                    "Lựa chọn D"
                ],
                "answer": "Lựa chọn phải khớp với đáp án chính xác của câu hỏi",
                "difficulty": difficulty
            }
        ]
    }

    prompt = f"""
    ### SYSTEM INSTRUCTION ###
    Bạn là một chuyên gia biên soạn đề thi giáo dục. Nhiệm vụ của bạn là tạo ra các câu hỏi trắc nghiệm khách quan (MCQ) chất lượng cao.

    ### USER REQUEST ###
    1. VAI TRÒ: Bạn là người biên soạn đề kiểm tra.
    2. ĐỘ KHÓ: Tạo các câu hỏi có độ khó '{difficulty}'.
    3. SỐ LƯỢNG: Tạo chính xác {num_questions} câu hỏi.
    4. YÊU CẦU ĐẶC BIỆT: Đáp án phải là một trong các lựa chọn trong trường 'options'.

    ### INPUT DATA (Tài liệu tham khảo) ###
    ---
    {text_chunk}
    ---

    ### OUTPUT FORMAT (Định dạng Đầu ra Bắt buộc) ###
    Trả lời bằng tiếng Việt và chỉ cung cấp đầu ra JSON. KHÔNG thêm bất kỳ văn bản giải thích nào khác ngoài cấu trúc JSON.

    {json.dumps(json_format_example, indent=2)}
    """

    return prompt
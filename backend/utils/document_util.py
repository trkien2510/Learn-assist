from io import BytesIO
from typing import List
from pypdf import PdfReader
from docx import Document as DocxDocument
from fastapi import UploadFile

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
PDF_MIME = "application/pdf"


def extract_text_from_pdf_pypdf(file_content: bytes) -> str:
    text_list: List[str] = []

    try:
        reader = PdfReader(BytesIO(file_content))

        for page in reader.pages:
            text_list.append(page.extract_text() or "")

        full_text = "\n".join(text_list).strip()
        return full_text

    except Exception as e:
        print(f"Lỗi khi trích xuất PDF bằng pypdf: {e}")
        return ""


def extract_text_from_docx_python_docx(file_content: bytes) -> str:
    try:
        doc = DocxDocument(BytesIO(file_content))

        full_text = "\n".join([paragraph.text for paragraph in doc.paragraphs]).strip()
        return full_text

    except Exception as e:
        print(f"Lỗi khi trích xuất DOCX bằng python-docx: {e}")
        return ""


async def read_and_clean_uploaded_file(file: UploadFile) -> str | None:
    """
    Đọc và trích xuất nội dung văn bản từ file tải lên (PDF hoặc DOCX).
    
    Args:
        file: File tải lên từ FastAPI UploadFile
        
    Returns:
        Nội dung văn bản đã trích xuất, hoặc None nếu lỗi hoặc không hỗ trợ
    """
    mime_type = file.content_type

    if mime_type not in [DOCX_MIME, PDF_MIME]:
        return None

    try:
        file_content = await file.read()

        extracted_text = ""

        if mime_type == PDF_MIME:
            extracted_text = extract_text_from_pdf_pypdf(file_content)

        elif mime_type == DOCX_MIME:
            extracted_text = extract_text_from_docx_python_docx(file_content)

        if not extracted_text:
            return None

        return extracted_text

    except Exception as e:
        print(f"Lỗi trong quá trình đọc và trích xuất file: {e}")
        return None

    finally:
        await file.close()
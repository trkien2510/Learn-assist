from io import BytesIO
from typing import List
from pypdf import PdfReader
from docx import Document as DocxDocument


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
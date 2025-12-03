from fastapi import UploadFile
from utils.document_util import extract_text_from_docx_python_docx, extract_text_from_pdf_pypdf

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
PDF_MIME = "application/pdf"


async def read_and_clean_uploaded_file(file: UploadFile) -> str | None:
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
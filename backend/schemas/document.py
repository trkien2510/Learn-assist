from datetime import datetime
from typing import Optional
from .common import MongoDBModel, PyObjectId

class DocumentModel(MongoDBModel):
    title: str
    uploaded_by: PyObjectId  # ID của giáo viên
    file_path: str
    content_text: str
    upload_date: datetime
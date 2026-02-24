from typing import Optional, List
from pydantic import BaseModel


class MarkReadRequest(BaseModel):
    notification_ids: Optional[List[str]] = None

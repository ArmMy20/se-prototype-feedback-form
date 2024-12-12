from typing import Optional
from pydantic import BaseModel


class Assignment(BaseModel):
    assignment_id: Optional[str] = ""
    assignment_name: str
    assignment_assigned_by: str
    assignment_tags: str

    def set_id(self, new_seq: int):
        self.assignment_id = f"A{new_seq}"

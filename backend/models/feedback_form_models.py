

from pydantic import BaseModel


class FeedbackFormCriteriaEntry(BaseModel):
    name: str
    description: str
    marks: int

class FeedbackFormCriteria(BaseModel):
    assignment_id: str
    criteria: list[FeedbackFormCriteriaEntry]
    totalMarks: int

class FeedbackFormResponse(BaseModel):
    criteria: str
    comment: str
    marks: int

class StudentSubmission(BaseModel):
    studentId: str
    markerId: str
    feedback: list[FeedbackFormResponse]
    overallMarks: int

class Submission(BaseModel):
    assignment_id: str
    submission: StudentSubmission

class AssignmentSubmissions(BaseModel):
    assignment_id: str
    submissions: list[Submission]
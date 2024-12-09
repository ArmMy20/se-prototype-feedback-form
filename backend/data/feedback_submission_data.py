

import json
from backend.data.json_data_file import JsonRecordFile
from backend.models.feedback_form_models import StudentSubmission, Submission


class FeedbackSubmissionData(JsonRecordFile):
    def __init__(self):
        super().__init__("backend/data/feedback-submission-data.json")

    def getRecordByAssignmentId(self, a_id: str):
        found = False
        result = {"assignment_id": a_id, "submissions": []}
        for record in self.getRecords():
            if record["assignment_id"] == a_id:
                result = record
                found = True
                break

        if not found:
            self.all_records.append(result)
        return result
    
    def getSubmissionByStudentId(self, assignment_record: dict, student_Id: str):
        submission_index = -1
        submission_found = None
        for index, submission in enumerate(assignment_record["submissions"]):
            if submission["studentId"] == student_Id:
                submission_index = index
                submission_found = submission
                break
        return submission_index, submission_found
    
    def updateSubmission(self, assignment_record: dict, submission_index: int, student_submission: StudentSubmission):
        assignment_record["submissions"][submission_index] = student_submission.model_dump()

    def addOrUpdate(self, assignment_record: dict, student_submission: StudentSubmission):        
        submission_index, _ = self.getSubmissionByStudentId(assignment_record, student_submission.studentId)
        if submission_index >= 0:
            self.updateSubmission(assignment_record, submission_index, student_submission)
        else:
            assignment_record["submissions"].append(student_submission.model_dump())
 
    def addSubmission(self, new_submission: Submission):
        try:
            #self.all_records.append(new_submission.model_dump())
            assignment_record = self.getRecordByAssignmentId(new_submission.assignment_id)            
            self.addOrUpdate(assignment_record, new_submission.submission)

            with open(self.file_path, 'w') as file:
                json.dump(self.all_records, file, indent=4)

        except Exception as e:
            raise e 
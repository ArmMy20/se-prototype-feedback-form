from pprint import pprint
from unittest import TestCase

from pydantic import ValidationError

from backend.data.json_data_file import JsonRecordFile
from backend.models.assignment_model import Assignment
from backend.models.feedback_form_models import FeedbackFormCriteria, FeedbackFormCriteriaEntry, FeedbackFormResponse, Submission


class Test_Models(TestCase):
    def test_Assignment(self):
        # Test the Assignment model
        assignment = Assignment(assignment_name="Machine Learning", assignment_assigned_by="MO100", assignment_tags="AI")
        print(assignment)
        assignment.set_id(103)
        print(assignment)

    def test_AssignmentFail(self):
        # Test the Assignment model
        try:
            assignment = Assignment(assignment_assigned_by="MO100", assignment_tags="AI")
            print(assignment)
            assignment.set_id(103)
            print(assignment)
        except ValidationError as ve:
            print(str(ve))

    def test_AssignmentData(self):
        adata = JsonRecordFile(file_path = "backend/data/assignment-data.json")
        print(adata.getRecords())

    def test_FeedbackFormCriteria(self):
        entry1 = FeedbackFormCriteriaEntry(name= "Error Handling 1",
                                           description="Appropriate handling of edge cases and errors",
                                           marks=10)
        #print(entry1)

        entry2 = FeedbackFormCriteriaEntry(name="Submission Format 1",
                                           description="Adherence to submission guidelines (file names, formats)",
                                           marks=10)

        entry3 = FeedbackFormCriteriaEntry(name="Timeliness 1",
                                           description="Submitted before the deadline",
                                           marks=10)
        
        criteria = FeedbackFormCriteria(assignment_id="A105",
                                        criteria=[entry1, entry2, entry3],
                                        totalMarks=30)
        #print(dict(criteria.model_dump()))

        criteria_data = JsonRecordFile(file_path="backend/data/feedback-form-criteria.json")
        criteria_data.addRecord()
        
        
        print(criteria_data.getCriteria())

    def test_submission(self):
        response1 = FeedbackFormResponse(criteria= "UI/UX Design 1",
                                           comment="User-friendly and visually appealing.",
                                           marks=9)
        #print(entry1)

        response2 = FeedbackFormResponse(criteria="Responsiveness 1",
                                           comment="Works well on most devices.",
                                           marks=8)

        respsonse3 = FeedbackFormResponse(criteria="Functionality 1",
                                           comment="All features are functional.",
                                           marks=10)
        
        response4 = FeedbackFormResponse(criteria="Code Structure",
                                         comment="Well-organized and modular.",
                                         marks=8)
        
        response5 = FeedbackFormResponse(criteria="Accessibility",
                                         comment="Adheres to accessibility standards.",
                                         marks=9)
        
        submission1 = Submission(student_id="ST100",
                                 marker_id="MK100",
                                 feedback=[response1, response2, respsonse3, response4, response5],
                                 overallMarks=44)
        
        pprint(submission1.model_dump())
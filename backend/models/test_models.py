from unittest import TestCase

from pydantic import ValidationError

from backend.data.assignment_data import AssignmentData
from backend.models.assignment_model import Assignment


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
        adata = AssignmentData()
        print(adata.getAssignmentsAsJSON())
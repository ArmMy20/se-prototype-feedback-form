

import json

from backend.models.assignment_model import Assignment


class AssignmentData:

    file_path = "backend/data/assignment-data.json"
    all_assignments = None

    def __init__(self):
        try:
            with open(AssignmentData.file_path, 'r') as file:
                AssignmentData.all_assignments = json.load(file)
        except Exception as e:
            raise e
        
    def getAssignments(self):        
        return AssignmentData.all_assignments
    
    def getAssignmentsAsJSON(self):
        retval = {'': self.getAssignments()}
        #return json.dumps(AssignmentData.all_assignments, indent=4)
        return json.dumps(retval, indent=4)
        
    def addAssignment(self, new_assignment: Assignment):
        try:        
            AssignmentData.all_assignments.append({                
                "assignment_id": new_assignment.assignment_id,
                "assignment_name":  new_assignment.assignment_name,
                "assignment_assigned_by": new_assignment.assignment_assigned_by,
                "assignment_tags": new_assignment.assignment_tags
            })

            with open(AssignmentData.file_path, 'w') as file:
                json.dump(AssignmentData.all_assignments, file, indent=4)

        except Exception as e:
            raise e    
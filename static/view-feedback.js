document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('assignmentId');
    const studentId = urlParams.get('studentId');

    if (!assignmentId || !studentId) {
        alert('Missing assignment or student information.');
        window.close();
        return;
    }

    try {
        const gradedSubmission = await fetchFeedbackSubmissionFromJSON(assignmentId, studentId);
        if (!gradedSubmission) {
            alert('No feedback found for the specified assignment and student.');
            window.close();
            return;
        }

        document.getElementById('assignment-details').textContent =
            `Assignment ${gradedSubmission.assignment_id} - Student ${gradedSubmission.student_id}`;

        loadFeedback(gradedSubmission);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        alert('Failed to load feedback. Please try again later.');
        window.close();
    }
});

async function fetchFeedbackSubmissionFromJSON(assignmentId, studentId) {
    try {
        const response = await fetch('feedback-submission-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assignment = data.find(assignment => String(assignment.assignment_id) === String(assignmentId));
        if (!assignment) return null;

        const submission = assignment.submissions.find(sub => String(sub.studentId) === String(studentId));
        return submission ? { ...submission, assignment_id: assignmentId } : null;
    } catch (error) {
        console.error('Error retrieving feedback submission from JSON:', error);
        throw error;
    }
}

function loadFeedback(gradedSubmission) {
    const container = document.getElementById('formContainer');
    let totalMaxMarks = 0;

    gradedSubmission.feedback.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('criteria-section');

        sectionDiv.innerHTML = `
            <div class="criteria-header">
                <h3 class="criteria-title">${section.criteria}</h3>
                <div class="marks-display">
                    <span>${section.marks}</span>
                    <span>/ ${section.maxMarks}</span>
                </div>
            </div>
            <div class="instructions-text">${section.comment || ''}</div>
        `;

        container.appendChild(sectionDiv);
        totalMaxMarks += parseInt(section.maxMarks, 10);
    });

    const totalSection = document.createElement('div');
    totalSection.classList.add('total-marks');
    totalSection.innerHTML = `
        <strong>Total Marks: </strong>
        <span>${gradedSubmission.overallMarks}</span>
        <span>/ ${totalMaxMarks}</span>
    `;
    container.appendChild(totalSection);
}

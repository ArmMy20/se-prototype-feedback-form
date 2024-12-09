document.addEventListener('DOMContentLoaded', function() {

    const gradedSubmission = JSON.parse(localStorage.getItem('currentGradedSubmission'));
    if (!gradedSubmission) {
        alert('No feedback found');
        window.close();
        return;
    }

    document.getElementById('assignment-details').textContent = 
        `Assignment ${gradedSubmission.assignmentId} - Student ${gradedSubmission.studentId}`;

    loadFeedback(gradedSubmission);
});

function loadFeedback(gradedSubmission) {
    const container = document.getElementById('formContainer');
    let totalMaxMarks = 0;

    gradedSubmission.sections.forEach(section => {
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
            <div class="instructions-text">${section.description || ''}</div>
            <div class="feedback-text">${section.feedback || 'No feedback provided.'}</div>
        `;
        
        container.appendChild(sectionDiv);
        totalMaxMarks += parseInt(section.maxMarks);
    });

    const totalSection = document.createElement('div');
    totalSection.classList.add('total-marks');
    totalSection.innerHTML = `
        <strong>Total Marks: </strong>
        <span>${gradedSubmission.totalMarks}</span>
        <span>/ ${totalMaxMarks}</span>
    `;
    container.appendChild(totalSection);
}

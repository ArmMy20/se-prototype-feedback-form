document.addEventListener('DOMContentLoaded', function() {
    const submissionData = JSON.parse(localStorage.getItem('currentSubmission'));
    if (!submissionData) {
        alert('No submission data found');
        window.close();
        return;
    }

    const existingKey = `graded_${submissionData.assignmentId}_${submissionData.studentId}`;
    const existingGrade = localStorage.getItem(existingKey);

    document.getElementById('assignment-details').textContent = 
        `Assignment ${submissionData.assignmentId} - Student ${submissionData.studentId}`;

    const deleteBtn = document.getElementById('deleteBtn');
    if (existingGrade) {
        deleteBtn.style.display = 'block';
    }

    document.getElementById('saveBtn').addEventListener('click', saveForm);
    deleteBtn.addEventListener('click', deleteGrade);

    loadForm(submissionData.form, existingGrade ? JSON.parse(existingGrade) : null);
});

function loadForm(formTemplate, existingGrade) {
    const container = document.getElementById('formContainer');
    let totalMaxMarks = 0;

    formTemplate.sections.forEach((section, index) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('criteria-section');
        
        const existingSection = existingGrade ? existingGrade.sections[index] : null;
        
        sectionDiv.innerHTML = `
            <div class="criteria-header">
                <h3 class="criteria-title">${section.criteria}</h3>
                <input type="number" class="marks-input" 
                    id="marks_${index}" 
                    max="10" 
                    placeholder="0"
                    value="${existingSection ? existingSection.marks : ''}"
                    onchange="updateTotalMarks()"
                >
                <span>/ 10</span>
            </div>
            <div class="instructions-text">${section.description || ''}</div>
            <textarea id="feedback_${index}" 
                placeholder="Enter feedback for this criteria..."
            >${existingSection ? existingSection.feedback : ''}</textarea>
        `;
        
        container.appendChild(sectionDiv);
        totalMaxMarks += 10;
    });

    const totalSection = document.createElement('div');
    totalSection.classList.add('total-marks');
    totalSection.innerHTML = `
        <strong>Total Marks: </strong>
        <span id="currentTotal">${existingGrade ? existingGrade.totalMarks : '0'}</span>
        <span>/ ${totalMaxMarks}</span>
    `;
    container.appendChild(totalSection);
}

function deleteGrade() {
    if (confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
        const submissionData = JSON.parse(localStorage.getItem('currentSubmission'));
        const key = `graded_${submissionData.assignmentId}_${submissionData.studentId}`;
        localStorage.removeItem(key);
        alert('Grade deleted successfully');
        window.location.reload();
    }
}

function updateTotalMarks() {
    const submissionData = JSON.parse(localStorage.getItem('currentSubmission'));
    const inputs = document.querySelectorAll('.marks-input');
    let total = 0;

    inputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });

    document.getElementById('currentTotal').textContent = total;
}

function saveForm() {
    const submissionData = JSON.parse(localStorage.getItem('currentSubmission'));
    const sections = [];
    let totalMarks = 0;

    submissionData.form.sections.forEach((section, index) => {
        const marks = document.getElementById(`marks_${index}`).value;
        const feedback = document.getElementById(`feedback_${index}`).value;
        
        sections.push({
            criteria: section.criteria,
            marks: marks || "0",
            feedback: feedback,
            maxMarks: section.marks,
            description: section.description
        });

        totalMarks += parseInt(marks) || 0;
    });

    const gradedSubmission = {
        assignmentId: submissionData.assignmentId,
        studentId: submissionData.studentId,
        markerId: submissionData.markerId,
        sections: sections,
        totalMarks: totalMarks,
        timestamp: new Date().toISOString()
    };

    const key = `graded_${submissionData.assignmentId}_${submissionData.studentId}`;
    localStorage.setItem(key, JSON.stringify(gradedSubmission));

    alert('Feedback saved successfully!');
    window.close();
}
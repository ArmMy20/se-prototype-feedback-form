let sectionCounter = 0;

function addCompleteSection() {
    sectionCounter++;
    const section = document.createElement('div');
    section.classList.add('section');
    section.id = `section-${sectionCounter}`;
    
    const removeIcon = document.createElement('i');
    removeIcon.classList.add('fa-solid', 'fa-x', 'remove-section-btn');
    removeIcon.onclick = function() {
        section.remove();
        updateTotalMarks();
    };
    section.appendChild(removeIcon);

    const form = document.createElement('form');
    form.classList.add('section-form');

    const criteriaInput = document.createElement('input');
    criteriaInput.type = 'text';
    criteriaInput.placeholder = 'Enter criteria';
    criteriaInput.classList.add('criteria-input');
    criteriaInput.required = true;
    form.appendChild(createField('Criteria', criteriaInput));

    const instructionInput = document.createElement('input');
    instructionInput.type = 'text';
    instructionInput.placeholder = 'Enter description of criteria';
    instructionInput.classList.add('description-input');
    instructionInput.required = true;
    form.appendChild(createField('Instructions', instructionInput));

    const feedbackTextarea = document.createElement('textarea');
    feedbackTextarea.placeholder = 'Enter feedback for students';
    feedbackTextarea.classList.add('feedback-input');
    feedbackTextarea.required = true;
    form.appendChild(createField('Feedback', feedbackTextarea));

    const markInput = document.createElement('input');
    markInput.type = 'number';
    markInput.placeholder = 'mark';
    markInput.classList.add('marks-input');
    markInput.required = true;
    markInput.min = '0';
    markInput.oninput = updateTotalMarks;
    form.appendChild(createField('Mark', markInput));

    section.appendChild(form);
    addToContainer(section);
}

function createBaseSection() {
    const section = document.createElement('div');
    section.classList.add('section');
    section.id = `section-${sectionCounter}`;
    
    const removeIcon = document.createElement('i');
    removeIcon.classList.add('fa-solid', 'fa-x', 'remove-section-btn');
    removeIcon.onclick = function() {
        section.remove();
        updateTotalMarks();
    };
    section.appendChild(removeIcon);
    
    return section;
}

function createField(labelText, inputElement) {
    const field = document.createElement('div');
    field.classList.add('field');
    const label = document.createElement('label');
    label.textContent = labelText;
    field.appendChild(label);
    field.appendChild(inputElement);
    return field;
}

function addToContainer(section) {
    document.getElementById('sectionsContainer').appendChild(section);
    updateTotalMarks();
}

function updateTotalMarks() {
    const totalMarksInput = document.getElementById('totalMarks');
    let totalMarks = 0;

    const marksInputs = document.querySelectorAll('.marks-input');
    marksInputs.forEach(input => {
        if (input.value) {
            totalMarks += parseFloat(input.value);
        }
    });

    totalMarksInput.value = totalMarks;
}

function getAssignmentId() {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('assignmentId');
    console.log('URL Parameters:', window.location.search); 
    console.log('Assignment ID:', assignmentId); // Debug log
    return assignmentId;
}

function saveForm() {
    const assignmentId = localStorage.getItem('currentFeedbackAssignment');

    const formData = {
        assignmentId: assignmentId,
        sections: [],
        totalMarks: document.getElementById('totalMarks').value
    };

    document.querySelectorAll('.section').forEach(section => {
        const form = section.querySelector('form');
        const sectionData = {
            criteria: form.querySelector('.criteria-input').value,
            description: form.querySelector('.description-input').value,
            feedback: form.querySelector('.feedback-input').value,
            marks: form.querySelector('.marks-input').value
        };
        
        formData.sections.push(sectionData);
    });

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser.user_id;
    const storageKey = `feedback_${currentUserId}_${assignmentId}`;
    
    localStorage.setItem(storageKey, JSON.stringify(formData));
    
    alert('Form Saved Successfully!');
    window.location.href = 'index.html';
}

function deleteForm() {
    const assignmentId = localStorage.getItem('currentFeedbackAssignment');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser.user_id;
    const storageKey = `feedback_${currentUserId}_${assignmentId}`;
    
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
        // Remove the form from localStorage
        localStorage.removeItem(storageKey);
        alert('Form Deleted Successfully!');
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const assignmentId = localStorage.getItem('currentFeedbackAssignment');
    console.log('Current Assignment ID:', assignmentId);
    
    if (!assignmentId) {
        alert('No assignment selected');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('currentAssignmentId').textContent = assignmentId;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser.user_id;
    const storageKey = `feedback_${currentUserId}_${assignmentId}`;
    const existingForm = localStorage.getItem(storageKey);

    if (existingForm) {

        document.getElementById('deleteBtn').style.display = 'inline-block';
        
        const formData = JSON.parse(existingForm);
        
        formData.sections.forEach(sectionData => {
            addCompleteSection();
            
            const sections = document.querySelectorAll('.section');
            const currentSection = sections[sections.length - 1];
            const form = currentSection.querySelector('form');
            
            form.querySelector('.criteria-input').value = sectionData.criteria;
            form.querySelector('.description-input').value = sectionData.description;
            form.querySelector('.feedback-input').value = sectionData.feedback;
            form.querySelector('.marks-input').value = sectionData.marks;
        });
        
        document.getElementById('totalMarks').value = formData.totalMarks;
    }
});
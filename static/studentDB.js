document.addEventListener('DOMContentLoaded', function() {
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("Current User:", currentUser);

    if (!currentUser || currentUser.role !== 'Student') {
        window.location.href = 'login-frontend-page.html';
        return;
    }

    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
        welcomeText.textContent = `Welcome, ${currentUser.username}`;
    }

    loadStudentAssignments(currentUser.user_id);
});

function loadStudentAssignments(studentId) {
    console.log("Looking for student ID:", studentId);

    const container = document.querySelector('.assignments-grid');
    if (!container) {
        console.error('Error: Could not find assignments-grid element');
        return;
    }

    fetch('feedback-submission-data.json')
        .then(response => response.json())
        .then(data => {
            console.log("Loaded data:", data);
            container.innerHTML = ''; 
            
            let assignmentsFound = false;
            
            data.forEach(assignment => {
                const submission = assignment.submissions.find(sub => 
                    String(sub.studentId) === String(studentId)
                );
                
                if (submission) {
                    assignmentsFound = true;
                    
                    const gradedKey = `graded_${assignment.assignment_id}_${studentId}`;
                    const gradedSubmission = localStorage.getItem(gradedKey);
                    const gradedData = gradedSubmission ? JSON.parse(gradedSubmission) : null;
                    
                    const assignmentCard = document.createElement('div');
                    assignmentCard.classList.add('assignment-card');
                    
                    assignmentCard.innerHTML = `
                        <h3 class="assignment-title">Assignment ${assignment.assignment_id}</h3>
                        <p class="marker-id">Marker: ${submission.markerId}</p>
                        <p class="final-mark">${gradedData ? `Mark: ${gradedData.totalMarks}/50` : 'Mark: Pending'}</p>
                        <i class="fa-solid fa-file file-icon"></i>
                    `;

                    const fileIcon = assignmentCard.querySelector('.file-icon');
                    fileIcon.addEventListener('click', () => {
                        if (gradedData) {
                            localStorage.setItem('currentGradedSubmission', JSON.stringify(gradedData));
                            window.open('view-feedback.html', '_blank', 'width=800,height=600');
                        } else {
                            alert('Feedback not available yet. The marker has not completed grading.');
                        }
                    });
                    
                    container.appendChild(assignmentCard);
                }
            });
            
            if (!assignmentsFound) {
                container.innerHTML = '<div class="no-assignments">No assignments found.</div>';
            }
        })
        .catch(error => {
            console.error('Error loading assignments:', error);
            container.innerHTML = '<div class="error-message">Error loading assignments. Please try again later.</div>';
        });
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login-frontend-page.html';
}

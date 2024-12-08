document.addEventListener('DOMContentLoaded', function() {
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'Marker') {
        window.location.href = 'login-frontend-page.html';
        return;
    }

    // Display marker name in the header
    document.getElementById('db').textContent = `Welcome, ${currentUser.username}`;

    // Load assignments for this marker
    loadMarkerAssignments(currentUser.user_id);

    // Add event listener for logout
    document.getElementById('logoutLink').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login-frontend-page.html';
    });
});

function loadMarkerAssignments(markerId) {
    fetch('feedback-submission-data.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('assignments-container');
            container.innerHTML = ''; // Clear existing content
            
            data.forEach(assignment => {
                // Filter submissions for this marker
                const markerSubmissions = assignment.submissions.filter(sub => sub.markerId === markerId);
                
                markerSubmissions.forEach(submission => {
                    // Find the feedback form for this assignment
                    let feedbackForm = null;
                    for (let key of Object.keys(localStorage)) {
                        if (key.includes(`_${assignment.assignment_id}`)) {
                            feedbackForm = localStorage.getItem(key);
                            break;
                        }
                    }

                    const box = document.createElement('div');
                    box.classList.add('assignment-box');
                    
                    box.innerHTML = `
                        <h3>Assignment ${assignment.assignment_id}</h3>
                        <div class="assignment-details">
                            <p><strong>Student ID:</strong> ${submission.studentId}</p>
                        </div>
                        <i class="fa-solid fa-file file-icon"></i>
                    `;
                    
                    container.appendChild(box);

                    // Add click event listener to the file icon
                    const fileIcon = box.querySelector('.file-icon');
                    fileIcon.addEventListener('click', function() {
                        if (feedbackForm) {
                            // Store both the form template and submission details
                            const submissionData = {
                                form: JSON.parse(feedbackForm),
                                assignmentId: assignment.assignment_id,
                                studentId: submission.studentId,
                                markerId: markerId
                            };
                            localStorage.setItem('currentSubmission', JSON.stringify(submissionData));
                            window.open('grade-submission.html', '_blank');
                        } else {
                            alert('No feedback form found for this assignment');
                        }
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error loading assignments:', error);
        });
}

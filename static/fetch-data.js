// === Initialization ===
window.onload = function () {
    initializeApp();
};

function migrateOldData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        console.log('No user logged in');
        return;
    }
    
    const currentUserId = currentUser.user_id;
    
    const oldAssignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const userAssignments = oldAssignments.filter(a => a.assignment_assigned_by === currentUserId);
    if (userAssignments.length > 0) {
        localStorage.setItem(`assignments_${currentUserId}`, JSON.stringify(userAssignments));
        // Clear old data
        localStorage.setItem('assignments', JSON.stringify(
            oldAssignments.filter(a => a.assignment_assigned_by !== currentUserId)
        ));
    }
}

function initializeApp() {
    if (loadUserData()) { 
        migrateOldData();
        loadAssignmentData();
        setupEventListeners();
    }
}

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login-frontend-page.html';
        return false; 
    }
    
    document.getElementById('db').textContent = `Welcome back, ${currentUser.username}!`;
    return true; 
}

function loadAssignmentData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login-frontend-page.html';
        return;
    }
    
    const currentUserId = currentUser.user_id;
    
    fetch('http://127.0.0.1:8000/get-assignments')
        .then(response => response.json())
        .then(assignments => {
            // Filter assignments by current user (if needed)
            const userAssignments = assignments.filter(a => a.assignment_assigned_by === currentUserId);
            displayAssignments(userAssignments);
        })
        .catch(error => {
            console.error('Error fetching assignments:', error);
            alert(`Failed to load assignments: ${error.message}`);
        });
}

function displayAssignments(assignmentData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login-frontend-page.html';
        return;
    }
    
    const container = document.getElementById('assignments-container');
    if (!container) {
        console.error('Required DOM element not found');
        return;
    }

    container.innerHTML = ''; // Clear existing assignments

    if (Array.isArray(assignmentData) && assignmentData.length > 0) {
        assignmentData.forEach(assignment => {         
            const assignmentDiv = document.createElement('div');
            assignmentDiv.classList.add('assignment-box');
            assignmentDiv.innerHTML = `
                <h3>${assignment.assignment_name || 'Unnamed Assignment'}</h3>
                <p class="assignment-id">ID: ${assignment.assignment_id || 'N/A'}</p>
                <p>Assigned By: ${assignment.assignment_assigned_by || 'Unknown'}</p>
                <p>Assignment Tags: ${assignment.assignment_tags || 'None'}</p>
                <div class="assignment-icons">
                    <i class="fa-solid fa-pen-to-square edit-icon"></i>
                </div>
            `;
            container.appendChild(assignmentDiv);

            const editIcon = assignmentDiv.querySelector('.edit-icon');
            editIcon.addEventListener('click', function () {
                handleEditAssignment(assignment);
            });
        });
    } else {
        container.innerHTML = '<p>No assignments found.</p>';
    }
}

function handleEditAssignment(assignment) {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'block';
    document.getElementById('assignment-name').value = assignment.assignment_name;
    document.getElementById('assignment-id').textContent = assignment.assignment_id;
    document.getElementById('assigned-by').textContent = assignment.assignment_assigned_by;
    document.getElementById('assignment-tags').value = assignment.assignment_tags || '';
}

function handleEditIconClick(e, assignmentData, index) {
    const assignmentDiv = e.target.closest('.assignment-box');
    const assignmentName = assignmentDiv.querySelector('h3').textContent;
    const assignmentId = assignmentDiv.querySelector('.assignment-id').textContent.replace('ID: ', '');
    const uniqueTag = assignmentDiv.querySelector('p:nth-child(4)').textContent.replace('Unique Tag: ', '');

    document.getElementById('assignment-name').value = assignmentName;
    document.getElementById('assignment-id').value = assignmentId;

    const uniqueTagSelect = document.getElementById('unique-tag');
    uniqueTagSelect.innerHTML = '<option value="">None</option>';
    
    const usedUniqueTags = assignmentData
        .filter((_, idx) => idx !== index)
        .map(a => a.unique_tag)
        .filter(Boolean);
    
    const availableTags = usedUniqueTags.filter(tag => tag !== uniqueTag);
    
    availableTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        uniqueTagSelect.appendChild(option);
    });

    if (uniqueTag && uniqueTag !== 'None') {
        uniqueTagSelect.value = uniqueTag;
    }

    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    modal.setAttribute('data-assignment-index', index);
}

function saveUpdatedAssignmentData(updatedAssignment) {
    fetch('http://127.0.0.1:8000/post-assignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
        },
        body: JSON.stringify(updatedAssignment)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update assignment');
            }
            return response.json();
        })
        .then(() => {
            alert('Assignment updated successfully!');
            loadAssignmentData();
        })
        .catch(error => {
            console.error('Error updating assignment:', error);
            alert('Error updating assignment. Please try again.');
        });
}

function setupEventListeners() {
    setupModalEvents();
    setupEditFormEvents();
    setupLogoutEvent();
}

async function createNewAssignment(newAssignment) {
    try {
        const response = await fetch('http://127.0.0.1:8000/post-assignment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
            },
            body: JSON.stringify(newAssignment)
        });

        if (!response.ok) {
            throw new Error('Failed to create assignment');
        }

        alert('Assignment created successfully!');
        loadAssignmentData(); // Refresh assignments

        document.getElementById('createModal').style.display = 'none';
        document.getElementById('createAssignmentForm').reset();
    } catch (error) {
        console.error('Error creating assignment:', error);
        alert('Failed to create assignment. Please try again.');
    }
}

function getTagsFromLocalStorage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];
    
    const currentUserId = currentUser.user_id;

    // Retrieve tags specific to the current user
    const userTags = JSON.parse(localStorage.getItem(`tags_${currentUserId}`)) || [];

    console.log('Retrieved unique tags for user:', currentUserId, '=>', userTags);
    return userTags;
}

function setupModalEvents() {
    // Close modal handlers
    const closeModal = () => {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('createModal').style.display = 'none';
        document.getElementById('createAssignmentForm').reset();
        document.getElementById('new-unique-tag').innerHTML = ''; // Reset unique tag dropdown
    };

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeCreateModal').addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (
            event.target === document.getElementById('editModal') ||
            event.target === document.getElementById('createModal')
        ) {
            closeModal();
        }
    });

    const createBtn = document.getElementById('createBtn');
    const createModal = document.getElementById('createModal');

    // Open the create assignment modal
    createBtn.addEventListener('click', () => {
        createModal.style.display = 'block';
        document.getElementById('new-assignment-name').value = '';
        document.getElementById('new-unique-tag').innerHTML = '';

        const allTags = getTagsFromLocalStorage();
        const assignments = JSON.parse(localStorage.getItem('assignments')) || [];

        // Filter out tags already used as unique tags
        const usedUniqueTags = assignments.map(a => a.unique_tag).filter(Boolean);
        const availableTags = allTags.filter(tag => !usedUniqueTags.includes(tag));

        // Populate unique tag dropdown
        const uniqueTagSelect = document.getElementById('new-unique-tag');
        uniqueTagSelect.innerHTML = '<option value="">None</option>'; // Default option
        availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            uniqueTagSelect.appendChild(option);
        });
    });

    // Handle the form submission to create a new assignment
    document.getElementById('createAssignmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('new-assignment-name').value.trim();
        const uniqueTag = document.getElementById('new-unique-tag').value.trim();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!name) {
            alert('Assignment name is required');
            return;
        }

        const newAssignment = {
            assignment_name: name,
            assignment_assigned_by: currentUser.user_id,
            unique_tag: uniqueTag || null // Allow unique tags to be optional
        };

        try {
            // Send the new assignment to the backend
            const response = await fetch('http://127.0.0.1:8000/post-assignment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}` // Assuming a token is required
                },
                body: JSON.stringify(newAssignment)
            });

            if (!response.ok) {
                throw new Error('Failed to create assignment');
            }

            alert('Assignment Created Successfully!');
            closeModal();

            // Reload the assignments list
            loadAssignmentData();
        } catch (error) {
            console.error('Error creating assignment:', error);
            alert('Error creating assignment. Please try again.');
        }
    });
}

function setupEditFormEvents() {
    const editForm = document.getElementById('editAssignmentForm');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedName = document.getElementById('assignment-name').value.trim();
        const updatedId = document.getElementById('assignment-id').value.trim();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentUserId = currentUser.user_id;
        const updatedUniqueTag = document.getElementById('unique-tag').value;

        if (!updatedName || !updatedId) {
            alert('Please fill in all required fields');
            return;
        }

        const assignmentIndex = document.getElementById('editModal').getAttribute('data-assignment-index');
        const assignmentData = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];
        const currentAssignment = assignmentData[assignmentIndex];

        const updatedAssignment = {
            ...currentAssignment,
            assignment_name: updatedName,
            assignment_id: updatedId,
            assignment_assigned_by: currentUserId,
            unique_tag: updatedUniqueTag
        };

        assignmentData[assignmentIndex] = updatedAssignment;
        localStorage.setItem(`assignments_${currentUserId}`, JSON.stringify(assignmentData));

        const modal = document.getElementById('editModal');
        modal.style.display = 'none';
        displayAssignments(assignmentData);
    });

    document.getElementById('deleteAssignmentButton').addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentUserId = currentUser.user_id;
        
        const assignmentIndex = document.getElementById('editModal').getAttribute('data-assignment-index');
        const assignmentData = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];

        if (assignmentData[assignmentIndex]) {
            assignmentData.splice(assignmentIndex, 1);
            localStorage.setItem(`assignments_${currentUserId}`, JSON.stringify(assignmentData));

            const assignmentDiv = document.querySelectorAll('.assignment-box')[assignmentIndex];
            assignmentDiv.remove();

            const modal = document.getElementById('editModal');
            modal.style.display = 'none';
            
            // Refresh the display
            displayAssignments(assignmentData);
        }
    });
}

function setupLogoutEvent() {
    document.getElementById('nav-logout').addEventListener('click', function(e) {
        e.preventDefault();

        localStorage.removeItem('currentUser');

        window.location.href = 'login-frontend-page.html';
    });
}

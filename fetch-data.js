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
    
    const oldTags = JSON.parse(localStorage.getItem('tags')) || [];
    if (oldTags.length > 0) {
        localStorage.setItem(`tags_${currentUserId}`, JSON.stringify(oldTags));
        localStorage.removeItem('tags');
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
    
    let assignments = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];
    if (assignments.length === 0) {
        
        const oldAssignments = JSON.parse(localStorage.getItem('assignments')) || [];
        assignments = oldAssignments.filter(a => a && a.assignment_assigned_by === currentUserId);
    }

    console.log('Loading assignments for user:', currentUserId);
    console.log('Found assignments:', assignments);
    
    displayAssignments(assignments);
}

function displayAssignments(assignmentData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login-frontend-page.html';
        return;
    }
    
    const container = document.getElementById('assignments-container');
    
    console.log('Displaying assignments:', assignmentData);
    console.log('Container element:', container);

    if (!container) {
        console.error('Required DOM elements not found');
        return;
    }

    container.innerHTML = '';

    if (Array.isArray(assignmentData) && assignmentData.length > 0) {
        assignmentData.forEach(assignment => {
            if (!assignment) return;
            
            const assignmentDiv = document.createElement('div');
            assignmentDiv.classList.add('assignment-box');
            assignmentDiv.innerHTML = `
                <h3>${assignment.assignment_name || 'Unnamed Assignment'}</h3>
                <p class="assignment-id">ID: ${assignment.assignment_id || 'N/A'}</p>
                <p>Assigned By: ${assignment.assignment_assigned_by || 'Unknown'}</p>
                <p>Unique Tag: ${assignment.unique_tag || 'None'}</p>
                <div class="assignment-icons">
                    <i class="fa-solid fa-pen-to-square edit-icon"></i>
                    <i class="fa-solid fa-tag tag-icon"></i>
                </div>
            `;
            container.appendChild(assignmentDiv);

            const tagIcon = assignmentDiv.querySelector('.tag-icon');
            if (tagIcon) {
                tagIcon.addEventListener('click', function() {
                    localStorage.setItem('currentFeedbackAssignment', assignment.assignment_id);
                    window.location.href = 'feedback-form-builder.html';
                });
            }
        });
    } else {
        console.log('No assignments to display');
        container.innerHTML = '<p>No assignments found.</p>';
    }

    const editIcons = document.querySelectorAll('.edit-icon');
    editIcons.forEach((icon, index) => {
        icon.addEventListener('click', (e) => {
            handleEditIconClick(e, assignmentData, index);
        });
    });
}

function handleEditIconClick(e, assignmentData, index) {
    const assignmentDiv = e.target.closest('.assignment-box');
    const assignmentName = assignmentDiv.querySelector('h3').textContent;
    const assignmentId = assignmentDiv.querySelector('.assignment-id').textContent.replace('ID: ', '');
    const uniqueTag = assignmentDiv.querySelector('p:nth-child(4)').textContent
        .replace('Unique Tag: ', '');

    document.getElementById('assignment-name').value = assignmentName;
    document.getElementById('assignment-id').value = assignmentId;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('assigned-by').textContent = currentUser.user_id;

    const uniqueTagInput = document.getElementById('unique-tag');
    uniqueTagInput.value = uniqueTag !== 'None' ? uniqueTag : '';

    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    modal.setAttribute('data-assignment-index', index);
}

function saveUpdatedAssignmentData(updatedAssignment, index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser.user_id;
    
    const assignmentData = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];
    assignmentData[index] = updatedAssignment; 
    localStorage.setItem(`assignments_${currentUserId}`, JSON.stringify(assignmentData)); 
}

function saveTagsToLocalStorage(updatedTags) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser.user_id;
    localStorage.setItem(`tags_${currentUserId}`, JSON.stringify(updatedTags));
}

function displayTags(tags, container) {
    if (!container) return;
    
    container.innerHTML = ''; 
    
    const sortedTags = [...tags].sort((a, b) => a.localeCompare(b));
    
    sortedTags.forEach(tag => {
        if (!tag) return;
        
        const tagItem = document.createElement('div');
        tagItem.classList.add('tag-item'); 

        const tagText = document.createElement('span');
        tagText.textContent = tag;

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fa-solid', 'fa-x'); 

        deleteIcon.addEventListener('click', () => {
            removeTag(tag); 
        });

        tagItem.appendChild(tagText);
        tagItem.appendChild(deleteIcon);
        container.appendChild(tagItem);
    });
}

function displayTagsInModal(tags, uniqueTag) {
    const modalTagContainer = document.getElementById('available-tags');
    modalTagContainer.innerHTML = '';
    
    const selectedTagsContainer = document.getElementById('assignment-tags');
    const selectedTags = Array.from(selectedTagsContainer.querySelectorAll('.selected-tag'))
        .map(button => button.textContent);
    
    const availableTags = tags.filter(tag => 
        !selectedTags.includes(tag) && tag !== uniqueTag
    );
    
    availableTags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.type = 'button';
        tagButton.classList.add('tag-button');
        tagButton.textContent = tag;
        
        tagButton.addEventListener('click', () => {
            const selectedTagButton = document.createElement('button');
            selectedTagButton.type = 'button';
            selectedTagButton.classList.add('tag-button', 'selected-tag');
            selectedTagButton.textContent = tag;
            
            selectedTagButton.addEventListener('click', () => {
                selectedTagButton.remove();
                displayTagsInModal(tags, uniqueTag);
            });
            
            selectedTagsContainer.appendChild(selectedTagButton);
            tagButton.remove();
        });
        
        modalTagContainer.appendChild(tagButton);
    });
}

function getTagsFromLocalStorage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];
    
    const currentUserId = currentUser.user_id;
    let tags = JSON.parse(localStorage.getItem(`tags_${currentUserId}`)) || [];
    
    if (tags.length === 0) {
        tags = JSON.parse(localStorage.getItem('tags')) || [];
    }
    
    console.log('Retrieved tags for user', currentUserId, ':', tags);
    return tags;
}

function removeTag(tag) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser.user_id;
    
    const tags = getTagsFromLocalStorage();
    const updatedTags = tags.filter(t => t !== tag); 
    localStorage.setItem(`tags_${currentUserId}`, JSON.stringify(updatedTags)); 

    const assignments = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];
    const updatedAssignments = assignments.map(assignment => {

        assignment.assignment_tags = assignment.assignment_tags.filter(t => t !== tag);
        
        if (assignment.unique_tag === tag) {
            assignment.unique_tag = '';
        }
        return assignment;
    });

    localStorage.setItem(`assignments_${currentUserId}`, JSON.stringify(updatedAssignments));

    displayTags(updatedTags, document.getElementById('list-tags-js'));
    displayAssignments(updatedAssignments);
}

function setupEventListeners() {
    setupModalEvents();
    setupEditFormEvents();
    setupLogoutEvent();
}

function setupModalEvents() {
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('editModal').style.display = 'none';
    });

    const createBtn = document.getElementById('createBtn');
    const createModal = document.getElementById('createModal');
    const closeCreateModal = document.getElementById('closeCreateModal');

    createBtn.addEventListener('click', () => {
        createModal.style.display = 'block';
        document.getElementById('new-assigned-by').textContent = "MO101";
        document.getElementById('new-assignment-tags').innerHTML = '';
        const allTags = getTagsFromLocalStorage();
        const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
        
        const usedUniqueTags = assignments
            .map(a => a.unique_tag)
            .filter(tag => tag);
        
        const availableTags = allTags.filter(tag => !usedUniqueTags.includes(tag));

        const uniqueTagSelect = document.getElementById('new-unique-tag');
        uniqueTagSelect.innerHTML = '<option value="">None</option>';
        
        availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            uniqueTagSelect.appendChild(option);
        });

        const modalTagContainer = document.getElementById('new-available-tags');
        modalTagContainer.innerHTML = '';
        
        availableTags.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.type = 'button';
            tagButton.classList.add('tag-button');
            tagButton.textContent = tag;
            
            tagButton.addEventListener('click', () => {
                const selectedTagsContainer = document.getElementById('new-assignment-tags');
                const selectedTagButton = document.createElement('button');
                selectedTagButton.type = 'button';
                selectedTagButton.classList.add('tag-button', 'selected-tag');
                selectedTagButton.textContent = tag;
                
                selectedTagButton.addEventListener('click', () => {
                    selectedTagButton.remove();
                    modalTagContainer.appendChild(tagButton);
                });
                
                selectedTagsContainer.appendChild(selectedTagButton);
                tagButton.remove();
            });
            
            modalTagContainer.appendChild(tagButton);
        });
    });

    closeCreateModal.addEventListener('click', () => {
        createModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === createModal) {
            createModal.style.display = 'none';
        }
    });

    document.getElementById('createAssignmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentUserId = currentUser.user_id;
        const name = document.getElementById('new-assignment-name').value.trim();
        const id = document.getElementById('new-assignment-id').value.trim();
        const uniqueTag = document.getElementById('new-unique-tag').value.trim();
        
        if (!name || !id) {
            alert('Please fill in all required fields');
            return;
        }
        
        const assignments = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];
        
        if (assignments.some(a => a.assignment_id === id)) {
            alert('You already have an assignment with this ID. Please use a different ID.');
            return;
        }

        const newAssignment = {
            assignment_name: name,
            assignment_id: id,
            assignment_assigned_by: currentUserId,
            unique_tag: uniqueTag
        };

        assignments.push(newAssignment);
        localStorage.setItem(`assignments_${currentUserId}`, JSON.stringify(assignments));

        e.target.reset();
        document.getElementById('createModal').style.display = 'none';
        displayAssignments(assignments);
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        const editModal = document.getElementById('editModal');
        editModal.style.display = 'none';
        document.getElementById('editAssignmentForm').reset();
        document.getElementById('assignment-tags').innerHTML = '';
        document.getElementById('available-tags').innerHTML = '';
    });

    document.getElementById('closeCreateModal').addEventListener('click', () => {
        const createModal = document.getElementById('createModal');
        createModal.style.display = 'none';
        document.getElementById('createAssignmentForm').reset();
        document.getElementById('new-assignment-tags').innerHTML = '';
        document.getElementById('new-available-tags').innerHTML = '';
    });

    window.addEventListener('click', (event) => {
        const editModal = document.getElementById('editModal');
        const createModal = document.getElementById('createModal');
        
        if (event.target === editModal) {
            editModal.style.display = 'none';
            document.getElementById('editAssignmentForm').reset();
            document.getElementById('assignment-tags').innerHTML = '';
            document.getElementById('available-tags').innerHTML = '';
        }
        
        if (event.target === createModal) {
            createModal.style.display = 'none';
            document.getElementById('createAssignmentForm').reset();
            document.getElementById('new-assignment-tags').innerHTML = '';
            document.getElementById('new-available-tags').innerHTML = '';
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
        const updatedUniqueTag = document.getElementById('unique-tag').value.trim();

        if (!updatedName || !updatedId) {
            alert('Please fill in all required fields');
            return;
        }

        const assignmentIndex = document.getElementById('editModal').getAttribute('data-assignment-index');
        const assignmentData = JSON.parse(localStorage.getItem(`assignments_${currentUserId}`)) || [];
        const currentAssignment = assignmentData[assignmentIndex];

        if (assignmentData.some(assignment => 
            assignment !== currentAssignment && 
            assignment.assignment_id === updatedId
        )) {
            alert('You already have an assignment with this ID. Please use a different ID.');
            return;
        }

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

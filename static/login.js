document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('user-accounts.json')
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => 
                u.username === username && 
                u.password === password
            );

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                const role = user.role.toLowerCase();
                
                switch (role) {
                    case 'module organiser':
                        window.location.href = 'index.html';
                        break;
                    case 'marker':
                        window.location.href = 'marker.html';
                        break;
                    case 'student':
                        window.location.href = 'studentDB.html';
                        break;
                    default:
                        showError('Invalid user role');
                }
            } else {
                showError('Invalid username or password!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred during login');
        });
});

function showError(message) {
    const existingError = document.getElementById('errorMessage');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.marginTop = '10px';
    document.getElementById('container-login').appendChild(errorDiv);
}

document.querySelector('form').addEventListener('submit', async function(event) {    
    event.preventDefault();        
    submitForm();
});

function submitForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    var endPoint = 'http://127.0.0.1:8000/token';

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = fetch("/token", {
            method: 'POST', 
            body: formData             
        })
        .then((response) => response.json())
        .then((user) => {            
            if (user.username) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                console.log(localStorage);
                
                const role =  user.role.toLowerCase();               
                
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
        .catch((error) => console.log(error));                
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred during login');
    }
}

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

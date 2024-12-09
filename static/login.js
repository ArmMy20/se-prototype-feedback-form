document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values of username and password from the form
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send a POST request to the backend's /login endpoint
    fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
        .then((response) => {
            if (response.ok) {
                return response.json(); // Parse the response as JSON if successful
            } else {
                throw new Error('Invalid username or password!');
            }
        })
        .then((data) => {
            localStorage.setItem('currentUser', JSON.stringify(data));

            console.log("Server Response:", data);  // Log the response data
            if (data && data.role) {  // Ensure that data and role are defined
                const role = data.role.toLowerCase();

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
                showError('Invalid response data');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showError(error.message); // Display an error message to the user
        });
});

// Function to show an error message on the frontend
function showError(message) {
    const existingError = document.getElementById('errorMessage');
    if (existingError) {
        existingError.remove(); // Remove the existing error message if any
    }

    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.marginTop = '10px';
    document.getElementById('container-login').appendChild(errorDiv);
}

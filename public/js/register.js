function registerUser(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Make a POST request to register the user
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to register user');
        }
        return response.text(); // Returning the response body as text
    })
    .then(message => {
        alert("Registration successful! Redirecting to Login.");
        window.location.href = "/login";
    })
    .catch(error => {
        console.error('Error registering user:', error);
        alert("Username already exists.");
    });
}

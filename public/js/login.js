document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const username = formData.get('user');
        const password = formData.get('pass');

        console.log('Sending login request with username:', username);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: JSON.stringify({ user: username, pass: password }), 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                alert(responseData.message); 
                window.location.href = '/main';
            } else {
                alert(responseData.error);
            }
        } catch (error) {
            console.error('Error occurred during login:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
});

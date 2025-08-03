// public/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        errorMessageDiv.textContent = ''; 

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Login successful, save the token
            localStorage.setItem('token', data.token);

            // Decode token to get user role for redirection
            const payload = JSON.parse(atob(data.token.split('.')[1]));

            // Redirect based on role
            if (payload.user.role === 'admin' || payload.user.role === 'mentor') {
                window.location.href = '/admin/admin.html';
            } else if (payload.user.role === 'intern') {
                window.location.href = '/intern/intern.html';
            } else {
                throw new Error('Unknown user role.');
            }

        } catch (error) {
            errorMessageDiv.textContent = error.message;
        }
    });
});
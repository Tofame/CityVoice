document.addEventListener('DOMContentLoaded', () => {
    const userEmailSpan = document.getElementById('user-email');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const registerForm = document.getElementById('registerForm');
    const submitRegisterBtn = document.getElementById('submitRegisterBtn');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const passwordChecklist = document.getElementById('passwordRequirements');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const registerPrompt = document.getElementById('registerPrompt');
    const backToLogin = document.getElementById('backToLogin');

    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    function showMessage(message, type = 'info') {
        messageText.textContent = message;
        messageBox.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600', 'text-white', 'hidden', 'translate-y-full', 'opacity-0');
        messageBox.classList.add('fixed', 'bottom-5', 'right-5', 'px-6', 'py-3', 'rounded-lg', 'shadow-xl', 'transition-all', 'duration-300', 'transform', 'z-50');

        if (type === 'success') messageBox.classList.add('bg-green-600');
        else if (type === 'error') messageBox.classList.add('bg-red-600');
        else messageBox.classList.add('bg-blue-600');

        messageBox.classList.add('text-white');
        messageBox.classList.remove('translate-y-full', 'opacity-0', 'hidden');
        messageBox.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            messageBox.classList.remove('translate-y-0', 'opacity-100');
            messageBox.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => messageBox.classList.add('hidden'), 300);
        }, 3000);
    }

    async function fetchEmail(token) {
        try {
            const response = await fetch('/user/email', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.email;
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch user email:', response.status, errorData.error);
                if (response.status === 401 || response.status === 404) {
                    localStorage.removeItem('token');
                    updateUI();
                }
                throw new Error(errorData.error || 'Failed to fetch email');
            }
        } catch (error) {
            console.error('Network or parsing error:', error);
            return null;
        }
    }

    async function updateUI() {
        const token = localStorage.getItem('token');

        if (token) {
            const email = await fetchEmail(token);
            userEmailSpan.textContent = email || 'User';
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            hideLoginForm();
        } else {
            userEmailSpan.textContent = 'Guest';
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            hideLoginForm();
        }
    }

    function showLoginForm() {
        loginForm.classList.remove('hidden');
        setTimeout(() => loginForm.classList.add('show'), 10);
    }

    function hideLoginForm() {
        loginForm.classList.remove('show');
        setTimeout(() => loginForm.classList.add('hidden'), 300);
    }

    function showRegisterForm() {
        registerForm.classList.remove('hidden');
        setTimeout(() => registerForm.classList.add('show'), 10);
    }

    function hideRegisterForm() {
        registerForm.classList.remove('show');
        setTimeout(() => registerForm.classList.add('hidden'), 300);
    }

    loginBtn.onclick = () => {
        showLoginForm();
    };

    logoutBtn.onclick = () => {
        localStorage.removeItem('token');
        updateUI();
        showMessage('Logged out successfully!', 'info');
    };

    submitLoginBtn.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage('Please enter both email and password.', 'error');
            return;
        }

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                await updateUI();
                showMessage('Logged in successfully!', 'success');
                hideLoginForm();
            } else {
                showMessage(data.error || 'Invalid email or password.', 'error');
            }
        } catch (err) {
            showMessage('Network error. Please try again later.', 'error');
        }
    };

    submitRegisterBtn.onclick = async () => {
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!email || !password || !confirmPassword) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        const isValid =
            password.length >= 10 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /\d/.test(password) &&
            /[^A-Za-z0-9]/.test(password);

        if (!isValid) {
            showMessage('Password does not meet all requirements.', 'error');
            return;
        }

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerEmailInput.value = '';
                registerPasswordInput.value = '';
                confirmPasswordInput.value = '';
                passwordChecklist.querySelectorAll('li').forEach(li => {
                    li.classList.remove('text-green-600', 'font-semibold');
                    li.classList.add('text-gray-700');
                });

                showMessage('Registered successfully! You can now log in.', 'success');
                hideRegisterForm();
                showLoginForm();
            } else {
                showMessage(data.error || 'Registration failed.', 'error');
            }
        } catch (err) {
            showMessage('Network error. Please try again later.', 'error');
        }
    };

    registerPasswordInput.addEventListener('input', () => {
        const pwd = registerPasswordInput.value;

        const checks = {
            length: pwd.length >= 10,
            lowercase: /[a-z]/.test(pwd),
            uppercase: /[A-Z]/.test(pwd),
            digit: /\d/.test(pwd),
            special: /[^A-Za-z0-9]/.test(pwd)
        };

        for (const [key, valid] of Object.entries(checks)) {
            const item = passwordChecklist.querySelector(`[data-check="${key}"]`);
            if (valid) {
                item.classList.remove('text-gray-700');
                item.classList.add('text-green-600', 'font-semibold');
            } else {
                item.classList.add('text-gray-700');
                item.classList.remove('text-green-600', 'font-semibold');
            }
        }
    });

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitLoginBtn.click();
            }
        });
    });

    [registerEmailInput, registerPasswordInput].forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitRegisterBtn.click();
            }
        });
    });

    registerPrompt.onclick = () => {
        hideLoginForm();
        showRegisterForm();
    };

    backToLogin.onclick = () => {
        hideRegisterForm();
        showLoginForm();
    };

    updateUI();
});
const switchToRegisterForm = document.getElementById('switchToRegisterForm');
const switchToLoginForm = document.getElementById('switchToLoginForm');

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

document.addEventListener('DOMContentLoaded', () => {
    // something maybe?
});

switchToRegisterForm.onclick = () => {
    showRegisterForm();
};
switchToLoginForm.onclick = () => {
    showLoginForm();
};
const showLoginForm = () => {
    registerForm.classList.add('hidden')
    loginForm.classList.remove('hidden');
};
const showRegisterForm = () => {
    loginForm.classList.add('hidden')
    registerForm.classList.remove('hidden');
};

submitLoginBtn.onclick = async (e) => {
    e.preventDefault();

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
            showMessage('Logged in successfully!', 'success');
            goToLink('/userprofile', true);
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
const AccessLevel = {
    0: "Guest",
    1: "Normal User",
    2: "Moderator",
    3: "Admin"
};

document.addEventListener('DOMContentLoaded', () => {
    // Main buttons on navbar left side
    const homeLink = document.getElementById('homeLink');

    // Main Page Stuff
    const mainContent = document.getElementById('mainContent');

    const newsletterForm = document.getElementById('newsletterForm');

    const userInfoSpan = document.getElementById('user-info');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const adminPanelBtn = document.getElementById('adminPanelBtn');

    const registerForm = document.getElementById('registerForm');
    const submitRegisterBtn = document.getElementById('submitRegisterBtn');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const passwordChecklist = document.getElementById('passwordRequirements');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const registerPrompt = document.getElementById('registerPrompt');
    const backToLogin = document.getElementById('backToLogin');

    // User Profile
    const userProfileDiv = document.getElementById('userProfile');

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

    async function fetchUserProfile(token) {
        try {
            const response = await fetch('/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userProfile = await response.json();
                return userProfile;
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch user profile:', response.status, errorData.error);
                if (response.status === 401 || response.status === 404) {
                    localStorage.removeItem('token');
                    updateUI();
                }
                throw new Error(errorData.error || 'Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Network or parsing error:', error);
            return null;
        }
    }

    async function updateUI() {
        const token = localStorage.getItem('token');

        // Hide admin panel button
        adminPanelBtn.classList.add("hidden");

        if (token) {
            const userProfile = await fetchUserProfile(token);
            let showProfile = false;
            if (userProfile) {
                // Setting name (and surname if available)
                if(userProfile.name && userProfile.name.trim() !== "") {
                    var tmpText = userProfile.name;
                    if(userProfile.surname && userProfile.surname.trim() !== "") {
                        tmpText += " " + userProfile.surname;
                    }
                    userInfoSpan.textContent = tmpText;
                    showProfile = true;
                // Name not available, setting user id
                } else if(userProfile.user_id) {
                    userInfoSpan.textContent = 'User ' + userProfile.user_id;
                    showProfile = true;
                // There is profile but neither ID nor Name (that should never happen, would be a bug)
                } else {
                    userInfoSpan.textContent = '??? User';
                }
            } else {
                userInfoSpan.textContent = 'Unknown User';
            }
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            if(showProfile == true) {
                userInfoSpan.click(); // shows user profile basically
            } else {
                showMainContent(); // we are Guest so lets go to main content
            }

            // Show admin panel button
            if(AccessLevel[userProfile.access] == "Admin") {
                adminPanelBtn.classList.remove("hidden");
            }
        } else {
            userInfoSpan.textContent = 'Guest';
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            showMainContent(); // we are Guest so lets go to main content
        }
    }

    // Hides all content 'subpages' (we are single page design so forms basically)
    const hideAllContent = () => {
        mainContent.classList.add('hidden');
        registerForm.classList.add('hidden');
        loginForm.classList.add('hidden');
        userProfileDiv.classList.add('hidden');
    }

    const showLoginForm = () => {
        hideAllContent();
        loginForm.classList.remove('hidden');
    };

    function hideLoginForm() {
        setTimeout(() => loginForm.classList.add('hidden'), 300);
    }

    const showRegisterForm = () => {
        hideAllContent();
        registerForm.classList.remove('hidden');
    };

    function hideRegisterForm() {
        setTimeout(() => registerForm.classList.add('hidden'), 300);
    }

    const showMainContent = () => {
        registerForm.classList.add('hidden');
        loginForm.classList.add('hidden');
        userProfileDiv.classList.add('hidden');
        mainContent.classList.remove('hidden');
    };

    loginBtn.onclick = () => {
        showLoginForm();
    };

    logoutBtn.onclick = () => {
        localStorage.removeItem('token');
        updateUI();
        showMessage('Logged out successfully!', 'info');
        showMainContent();
    };

    homeLink.addEventListener('click', (e) => {
        showMainContent();
    });

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

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!email) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        try {
            const response = await fetch('/service/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Thanks for your interest! Check your email to confirm.', 'success');
                emailInput.value = '';
            } else {
                // backend always returns 200 on duplicate—but handle generic failure just in case
                showMessage(data.error || 'Signup failed. Please try again later.', 'error');
            }

        } catch (error) {
            showMessage('Network error. Please try again later.', 'error');
        }
    });

    function showUserProfile(profile) {
        hideAllContent();

        // fill fields
        profileEmail.textContent    = profile.email;
        profileName.textContent     = profile.name      || '-';
        profileSurname.textContent = profile.surname  || '-';
        profileVerified.textContent = profile.is_verified ? 'Yes' : 'No';
        profileCreated.textContent  = new Date(profile.created_at).toLocaleDateString();
        profileAccess.textContent   = AccessLevel[profile.access] || "Unknown";

        // show
        userProfile.classList.remove('hidden');
    }

    userInfoSpan.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) return; // probably a guest

        const profile = await fetchUserProfile(token);
        if (profile) showUserProfile(profile);
    });

    // Home Button
    document.querySelectorAll('.home-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Hide all other sections
            hideAllContent();
            mainContent.classList.remove('hidden');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    updateUI();
});
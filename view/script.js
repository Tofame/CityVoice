const AccessLevel = {
    0: "Guest",
    1: "Normal User",
    2: "Moderator",
    3: "Admin"
};

const ProjectStatus = {
    0: "Pending",
    1: "Rejected",
    2: "Accepted",
    3: "In Progress",
    4: "Cancelled",
    5: "Realized"
};

// Admin Panel config
let currentPage = 1;
const usersPerPage = 10;
let currentProjectPage = 1;
const projectsPerPage = 10;

// Helper method to trim string
function trimString(text, maxLength = 30) {
    if (!text) return null;
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

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
    // Admin Panel Elements
    const adminPanel = document.getElementById('adminPanel');
    const searchUser = document.getElementById('searchUser');
    const accessFilter = document.getElementById('accessFilter');
    const createdAfter = document.getElementById('createdAfter');
    const createdBefore = document.getElementById('createdBefore');
    const filterUsersBtn = document.getElementById('filterUsersBtn');
    const userList = document.getElementById('userList');
    const paginationControls = document.getElementById('paginationControls');

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
        adminPanel.classList.add('hidden');
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

            // Decision whether to keep it here or not, good for refreshing, so may stay I guess?
            fetchFeaturedProjects();

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // ====== Admin Panel Functionality
    async function fetchProjects(page = 1) {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Authentication required to access admin panel.', 'error');
            showLoginForm();
            return;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', projectsPerPage);

        const searchValue = searchProjectTitle.value.trim();
        if (searchValue) {
            queryParams.append('search', searchValue);
        }

        const categoryValue = categoryFilter.value;
        if (categoryValue) {
            queryParams.append('category', categoryValue);
        }

        const statusValue = statusFilter.value;
        if (statusValue) {
            queryParams.append('status', statusValue);
        }

        const createdAfterValue = createdAfter_Projects.value;
        if (createdAfterValue) {
            queryParams.append('created_after', createdAfterValue);
        }

        const createdBeforeValue = createdBefore_Projects.value;
        if (createdBeforeValue) {
            queryParams.append('created_before', createdBeforeValue);
        }

        try {
            const response = await fetch(`/project?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                renderProjectList(data.projects);
                renderProjectPagination(data.total, data.page, data.limit);
            } else {
                const errorData = await response.json();
                showMessage(errorData.error || 'Failed to fetch projects.', 'error');
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    updateUI();
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            showMessage('Network error: Could not connect to the server.', 'error');
        }
    }

    function renderProjectList(projects) {
        projectList.innerHTML = ''; // Clear current list
        if (projects.length === 0) {
            projectList.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">No projects found.</td></tr>';
            return;
        }

        projects.forEach(project => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-100');
            row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${project.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${project.title}</td>
            <td class="px-6 py-4 whitespace-nowrap">${project.author_id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${project.category || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${project.location || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap capitalize">${ProjectStatus[project.status] || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${new Date(project.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button data-project-id="${project.id}" class="text-blue-600 hover:text-blue-900 edit-project-btn">Edit</button>
                <button data-project-id="${project.id}" class="ml-2 text-red-600 hover:text-red-900 delete-project-btn">Delete</button>
            </td>
        `;
            projectList.appendChild(row);
        });

        // Attach event listeners to edit buttons
        projectList.querySelectorAll('.edit-project-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const projectId = e.currentTarget.dataset.projectId;
                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`/admin/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (!res.ok) throw new Error('Failed to fetch project');
                    const project = await res.json();

                    // Assuming you have inputs for editing project details:
                    document.getElementById('editProjectId').value = project.id;
                    document.getElementById('editProjectTitle').value = project.title || '';
                    document.getElementById('editProjectCategory').value = project.category || '';
                    document.getElementById('editProjectLocation').value = project.location || '';
                    document.getElementById('editProjectStatus').value = project.status || '';

                    document.getElementById('adminPanel_editProjectModal').classList.remove('hidden');
                } catch {
                    showMessage('Could not load project details', 'error');
                }
            });
        });

        // Attach event listeners to delete buttons
        projectList.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const projectId = e.currentTarget.dataset.projectId;

                if (!confirm(`Are you sure you want to delete project ID ${projectId}?`)) {
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    showMessage('You are not authorized to perform this action.', 'error');
                    return;
                }

                try {
                    const resp = await fetch(`/admin/projects/${projectId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const result = await resp.json();

                    if (resp.ok) {
                        showMessage(result.message || 'Project deleted.', 'success');
                        fetchProjects(currentProjectPage);
                    } else {
                        if (resp.status === 401 || resp.status === 403) {
                            localStorage.removeItem('token');
                            await updateUI();
                        }
                        showMessage(result.error || 'Failed to delete project.', 'error');
                    }
                } catch (err) {
                    console.error('Error deleting project:', err);
                    showMessage('Network error. Please try again later.', 'error');
                }
            });
        });
    }

    function renderProjectPagination(totalProjects, currentPage, limit) {
        paginationControls_Projects.innerHTML = '';
        const totalPages = Math.ceil(totalProjects / limit);

        if (totalPages <= 1) return;

        const createPageButton = (page, text = page) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('px-4', 'py-2', 'rounded-md', 'border');
            if (page === currentPage) {
                button.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
            } else {
                button.classList.add('bg-white', 'text-blue-600', 'border-gray-300', 'hover:bg-blue-50');
                button.addEventListener('click', () => {
                    currentProjectPage = page;
                    fetchProjects(currentProjectPage);
                });
            }
            return button;
        };

        if (currentPage > 1) {
            paginationControls_Projects.appendChild(createPageButton(currentPage - 1, 'Previous'));
        }

        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationControls_Projects.appendChild(createPageButton(i));
        }

        if (currentPage < totalPages) {
            paginationControls_Projects.appendChild(createPageButton(currentPage + 1, 'Next'));
        }
    }

    async function fetchUsers(page = 1) {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Authentication required to access admin panel.', 'error');
            showLoginForm();
            return;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', usersPerPage);

        const searchValue = searchUser.value.trim();
        if (searchValue) {
            queryParams.append('search', searchValue);
        }

        const accessValue = accessFilter.value;
        if (accessValue) {
            queryParams.append('access', accessValue);
        }

        const createdAfterValue = createdAfter.value;
        if (createdAfterValue) {
            queryParams.append('created_after', createdAfterValue);
        }

        const createdBeforeValue = createdBefore.value;
        if (createdBeforeValue) {
            queryParams.append('created_before', createdBeforeValue);
        }

        try {
            const response = await fetch(`/admin/users?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                renderUserList(data.users);
                renderPagination(data.total, data.page, data.limit);
            } else {
                const errorData = await response.json();
                showMessage(errorData.error || 'Failed to fetch users.', 'error');
                if (response.status === 401 || response.status === 403) { // Unauthorized or Forbidden
                    localStorage.removeItem('token');
                    updateUI(); // Go back to login or main page
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showMessage('Network error: Could not connect to the server.', 'error');
        }
    }

    function renderUserList(users) {
        userList.innerHTML = ''; // Clear current list
        if (users.length === 0) {
            userList.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-100');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${user.user_id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.name || '-'} ${user.surname || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(user.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.is_verified ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${AccessLevel[user.access] || 'Unknown'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-user-id="${user.user_id}" class="text-blue-600 hover:text-blue-900 edit-user-btn">Edit</button>
                    <button data-user-id="${user.user_id}" class="ml-2 text-red-600 hover:text-red-900 delete-user-btn">Delete</button>
                </td>
            `;
            userList.appendChild(row);
        });

        // Attach event listeners to edit/delete buttons (for future functionality)
        userList.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.userId;
                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (!res.ok) throw new Error('Failed to fetch user');
                    const user = await res.json();

                    document.getElementById('editUserId').value = user.user_id;
                    document.getElementById('editEmail').value = user.email || '';
                    document.getElementById('editName').value = user.name || '';
                    document.getElementById('editSurname').value = user.surname || '';
                    document.getElementById('editAccess').value = user.access;

                    document.getElementById('adminPanel_editUserModal').classList.remove('hidden');
                } catch {
                    showMessage('Could not load user details', 'error');
                }
            });
        });

        // Attach event listeners to delete buttons
        userList.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.userId;

                if (!confirm(`Are you sure you want to delete user ID ${userId}?`)) {
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    showMessage('You are not authorized to perform this action.', 'error');
                    return;
                }

                try {
                    const resp = await fetch(`/admin/users/${userId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const result = await resp.json();   // always attempt to read the body

                    if (resp.ok) {
                        showMessage(result.message || 'User deleted.', 'success');
                        fetchUsers(currentPage);        // refresh current list / page
                    } else {
                        // 401 / 403: token expired or lost admin rights, so force logout
                        if (resp.status === 401 || resp.status === 403) {
                            localStorage.removeItem('token');
                            await updateUI();
                        }
                        showMessage(result.error || 'Failed to delete user.', 'error');
                    }
                } catch (err) {
                    console.error('Error deleting user:', err);
                    showMessage('Network error. Please try again later.', 'error');
                }
            });
        });
    }

    function renderPagination(totalUsers, currentPage, limit) {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalUsers / limit);

        if (totalPages <= 1) return; // No pagination needed for 1 or fewer pages

        const createPageButton = (page, text = page) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('px-4', 'py-2', 'rounded-md', 'border');
            if (page === currentPage) {
                button.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
            } else {
                button.classList.add('bg-white', 'text-blue-600', 'border-gray-300', 'hover:bg-blue-50');
                button.addEventListener('click', () => {
                    currentPage = page;
                    fetchUsers(currentPage);
                });
            }
            return button;
        };

        // Previous button
        if (currentPage > 1) {
            paginationControls.appendChild(createPageButton(currentPage - 1, 'Previous'));
        }

        // Page numbers (simple approach for now, can be enhanced for many pages)
        const maxPageButtons = 5; // Show a maximum of 5 page buttons
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationControls.appendChild(createPageButton(i));
        }

        // Next button
        if (currentPage < totalPages) {
            paginationControls.appendChild(createPageButton(currentPage + 1, 'Next'));
        }
    }

    // Admin User Edit Modal cancel&save buttons
    document.getElementById('saveUserEdit').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('You are not authorized to perform this action.', 'error');
            return;
        }

        // Get form values
        const userId = document.getElementById('editUserId').value;
        const email = document.getElementById('editEmail').value.trim();
        const name = document.getElementById('editName').value.trim();
        const surname = document.getElementById('editSurname').value.trim();
        const access = parseInt(document.getElementById('editAccess').value);

        // Basic validation
        if (!email || isNaN(access)) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }

        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    name,
                    surname,
                    access
                })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('User updated successfully!', 'success');
                document.getElementById('adminPanel_editUserModal').classList.add('hidden');
                fetchUsers(currentPage); // Refresh the user list
            } else {
                showMessage(result.error || 'Failed to update user.', 'error');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showMessage('Network error. Please try again later.', 'error');
        }

        document.getElementById('adminPanel_editUserModal').classList.add('hidden');
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('adminPanel_editUserModal').classList.add('hidden');
    });

    // Event listener for Apply Filters buttons in Admin Panel
    filterUsersBtn.addEventListener('click', () => {
        currentPage = 1; // Reset to first page on filter change
        fetchUsers(currentPage);
    });
    filterProjectsBtn.addEventListener('click', () => {
        currentPage = 1; // Reset to first page on filter change
        fetchProjects(currentPage);
    });

    // Event listener for Admin Panel button click
    adminPanelBtn.onclick = async () => {
        hideAllContent();
        adminPanel.classList.remove('hidden');
        currentPage = 1; // Always start at page 1 when opening the admin panel
        await fetchUsers(currentPage);
        await fetchProjects(currentPage);
    };

    // ========== Home Page
    async function fetchFeaturedProjects() {
        try {
            const statusAcceptedKey = Object.keys(ProjectStatus).find(key => ProjectStatus[key] === "Accepted");
            const res = await fetch(`/project?page=1&limit=3&order=most_popular_up&status=${statusAcceptedKey}`, {
                method: 'GET'
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch projects');
            }

            renderFeaturedProjects(data.projects);
        } catch (err) {
            console.error('Error loading featured projects:', err);
            document.getElementById('featured_projects_list').innerHTML = `
            <p class="text-red-500 col-span-full text-center">Could not load featured projects.</p>
        `;
        }
    }
    function renderFeaturedProjects(projects) {
        const container = document.getElementById('featured_projects_list');
        container.innerHTML = ''; // clear existing static content

        if (!projects.length) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects found.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            card.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${trimString(project.description, 90) || 'No description provided.'}</p>
            <a href="/project/${project.project_id}" class="project-link">View project</a>
        `;

            container.appendChild(card);
        });
    }

    fetchFeaturedProjects();
    updateUI();
});
document.addEventListener('DOMContentLoaded', () => {
    // Admin Panel Elements
    const adminPanel = document.getElementById('adminPanel');
    const searchUser = document.getElementById('searchUser');
    const accessFilter = document.getElementById('accessFilter');
    const createdAfter = document.getElementById('createdAfter');
    const createdBefore = document.getElementById('createdBefore');
    const filterUsersBtn = document.getElementById('filterUsersBtn');
    const userList = document.getElementById('userList');
    const paginationControls = document.getElementById('paginationControls');

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

    function renderProjectPagination(totalProjects, currentUserPage, limit) {
        paginationControls_Projects.innerHTML = '';
        const totalPages = Math.ceil(totalProjects / limit);

        if (totalPages <= 1) return;

        const createPageButton = (page, text = page) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('px-4', 'py-2', 'rounded-md', 'border');
            if (page === currentUserPage) {
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

        if (currentUserPage > 1) {
            paginationControls_Projects.appendChild(createPageButton(currentUserPage - 1, 'Previous'));
        }

        const maxPageButtons = 5;
        let startPage = Math.max(1, currentUserPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationControls_Projects.appendChild(createPageButton(i));
        }

        if (currentUserPage < totalPages) {
            paginationControls_Projects.appendChild(createPageButton(currentUserPage + 1, 'Next'));
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
                        fetchUsers(currentUserPage);        // refresh current list / page
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

    function renderPagination(totalUsers, currentUserPage, limit) {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalUsers / limit);

        if (totalPages <= 1) return; // No pagination needed for 1 or fewer pages

        const createPageButton = (page, text = page) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('px-4', 'py-2', 'rounded-md', 'border');
            if (page === currentUserPage) {
                button.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
            } else {
                button.classList.add('bg-white', 'text-blue-600', 'border-gray-300', 'hover:bg-blue-50');
                button.addEventListener('click', () => {
                    currentUserPage = page;
                    fetchUsers(currentUserPage);
                });
            }
            return button;
        };

        // Previous button
        if (currentUserPage > 1) {
            paginationControls.appendChild(createPageButton(currentUserPage - 1, 'Previous'));
        }

        // Page numbers (simple approach for now, can be enhanced for many pages)
        const maxPageButtons = 5; // Show a maximum of 5 page buttons
        let startPage = Math.max(1, currentUserPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationControls.appendChild(createPageButton(i));
        }

        // Next button
        if (currentUserPage < totalPages) {
            paginationControls.appendChild(createPageButton(currentUserPage + 1, 'Next'));
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
                fetchUsers(currentUserPage); // Refresh the user list
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
        currentUserPage = 1; // Reset to first page on filter change
        fetchUsers(currentUserPage);
    });
    filterProjectsBtn.addEventListener('click', () => {
        currentUserPage = 1; // Reset to first page on filter change
        fetchProjects(currentUserPage);
    });

    currentUserPage = 1; // Always start at page 1 when opening the admin panel
    fetchUsers(currentUserPage);
    fetchProjects(currentUserPage);
});
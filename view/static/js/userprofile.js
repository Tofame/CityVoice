const profileEmail    = document.getElementById('profileEmail');
const profileName     = document.getElementById('profileName');
const profileSurname  = document.getElementById('profileSurname');
const profileVerified = document.getElementById('profileVerified');
const profileCreated  = document.getElementById('profileCreated');
const profileAccess   = document.getElementById('profileAccess');

const submittedProjectList = document.getElementById('submittedProjectList');

document.addEventListener('DOMContentLoaded', () => {
    showUserProfile();
});

async function showUserProfile() {
    const token = getAuthToken();

    if (!token) {
        showMessage('Could not load user profile. Please login.', 'error');
        fillProfileFields(null);
        return;
    }

    const profile = await fetchUserProfile(token);
    if (!profile) {
        showMessage('Failed to load user profile.', 'error');
        fillProfileFields(null);
        return;
    }

    fillProfileFields(profile);
    await loadUserProjects(token);
}

function fillProfileFields(profile) {
    if (!profile) {
        profileEmail.textContent = '-';
        profileName.textContent = '-';
        profileSurname.textContent = '-';
        profileVerified.textContent = '-';
        profileCreated.textContent = '-';
        profileAccess.textContent = '-';
        return;
    }

    profileEmail.textContent = profile.email || '-';
    profileName.textContent = profile.name || '-';
    profileSurname.textContent = profile.surname || '-';
    profileVerified.textContent = profile.is_verified ? 'Yes' : 'No';
    profileCreated.textContent = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-';
    profileAccess.textContent = AccessLevel?.[profile.access] || "Unknown";

    // Not needed currently since navigation_bar is loading every page change
    //updateNavUI_UserProfile();
}

const projectModal = document.getElementById('submitProjectModal');
const projectModal_openBtn = document.getElementById('btnSubmitProject');
const projectModal_closeBtn = document.getElementById('closeModal');

projectModal_openBtn.addEventListener('click', () => {
    projectModal.classList.remove('hidden');
    projectModal.classList.add('flex');
});

projectModal_closeBtn.addEventListener('click', () => {
    projectModal.classList.remove('flex');
    projectModal.classList.add('hidden');
});

document.getElementById('submitProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim();
    const cost = parseInt(e.target.cost.value);
    const district = parseInt(e.target.district.value);
    const category = parseInt(e.target.category.value);

    if (!title || !description || isNaN(cost) || cost < 0 || !district || !category) {
        showMessage("Please fill in all required fields correctly.", "error");
        return;
    }

    try {
        const token = getAuthToken(); // Assuming getAuthToken() is defined elsewhere
        const response = await fetch('/api/project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                title,
                description,
                cost,
                district,
                category
            })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage("Project submitted successfully!", "success");
            projectModal.classList.add('hidden');
            projectModal.classList.remove('flex');
            e.target.reset();
        } else {
            showMessage(result.error || "Failed to submit project. Please try again.", "success");
        }
    } catch (err) {
        showMessage("Network error or unexpected issue. Please check your connection and try again.", "error");
    }
});

async function loadUserProjects(token) {
    submittedProjectList.innerHTML = '';

    try {
        const response = await fetch('/api/user/projects', {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || "Failed to load projects.", "error");
            return;
        }

        if (!result.projects || result.projects.length === 0) {
            submittedProjectList.innerHTML = `<p class="text-gray-600 text-center">No projects submitted yet.</p>`;
            return;
        }

        result.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'border border-gray-300 rounded p-4 shadow-sm';

            projectCard.innerHTML = `
                <h4 class="text-lg font-semibold text-gray-800 mb-1">${project.title}</h4>
                <p class="text-sm text-gray-600 mb-2">${project.description}</p>
                <div class="text-sm text-gray-700 space-y-1">
                    <p><strong>Category:</strong> ${ProjectCategory[project.category]}</p>
                    <p><strong>District:</strong> ${ProjectDistrict[project.district]}</p>
                    <p><strong>Status:</strong> ${ProjectStatus[project.status]}</p>
                    <p><strong>Cost:</strong> ${formatCost(project.cost)} PLN</p>
                    <p><strong>Created:</strong> ${new Date(project.created_at).toLocaleDateString()}</p>
                </div>
            `;

            submittedProjectList.appendChild(projectCard);
        });

    } catch (err) {
        showMessage("Error fetching projects. Try again later.", "error");
    }
}
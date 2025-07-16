document.addEventListener('DOMContentLoaded', () => {
    updateNavUI_UserProfile();
});

const nb_userInfoBtn = document.getElementById('nb_userInfoBtn');
const nb_adminPanelBtn = document.getElementById('nb_adminPanelBtn');
const nb_loginBtn = document.getElementById('nb_loginBtn');
const nb_logoutBtn = document.getElementById('nb_logoutBtn');
const nb_homeBtns = document.querySelectorAll('.home-link');

// UserProfile Button
nb_userInfoBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // probably a guest

    goToLink('/userprofile');

    const profile = await fetchUserProfile(token);
    if (profile) showUserProfile(profile);
});

// Login/Logout Button
nb_loginBtn.onclick = () => {
    goToLink('/login');
};
nb_logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    goToLink('/home');
    updateUI();
    showMessage('Logged out successfully!', 'info');
};

// Home Button
nb_homeBtns.forEach(homeBtn => {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToLink('/home');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Admin Panel Button
nb_adminPanelBtn.onclick = async () => {
    goToLink('/adminpanel', true)
};

function goToLink(link, force = false) {
    if(!force) {
        if (link === "/userprofile" && nb_userInfoBtn.textContent === "Guest") {
            return;
        }
    }

    window.location.href = link;
}

// User Profile related (the bar needs it for the right side buttons)
async function fetchUserProfile(token) {
    try {
        const response = await fetch('/user/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to fetch user profile:', response.status, errorData.error);
            if (response.status === 401 || response.status === 404) {
                // Token invalid or user not found, clear token and update UI
                localStorage.removeItem('token');
                await updateNavUI_UserProfile();
            }
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Network or parsing error:', error);
        return null;
    }
}

async function updateNavUI_UserProfile() {
    const token = localStorage.getItem('token');

    // Always hide admin button initially
    nb_adminPanelBtn.classList.add("hidden");

    if (!token) {
        // Guest state
        nb_userInfoBtn.textContent = 'Guest';
        nb_loginBtn.classList.remove('hidden');
        nb_logoutBtn.classList.add('hidden');
        return;
    }

    const userProfile = await fetchUserProfile(token);
    if (!userProfile) {
        // Could not fetch user profile (maybe token invalid)
        nb_userInfoBtn.textContent = 'Unknown User';
        nb_loginBtn.classList.remove('hidden');
        nb_logoutBtn.classList.add('hidden');
        return;
    }

    // Build user display name
    let displayName = '??? User';
    if (userProfile.name?.trim()) {
        displayName = userProfile.name;
        if (userProfile.surname?.trim()) {
            displayName += ' ' + userProfile.surname;
        }
    } else if (userProfile.user_id) {
        displayName = 'User ' + userProfile.user_id;
    }

    nb_userInfoBtn.textContent = displayName;
    nb_loginBtn.classList.add('hidden');
    nb_logoutBtn.classList.remove('hidden');

    // Show admin button if user has admin access
    if (AccessLevel?.[userProfile.access] === "Admin") {
        nb_adminPanelBtn.classList.remove("hidden");
    }
}
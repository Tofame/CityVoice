const profileEmail    = document.getElementById('profileEmail');
const profileName     = document.getElementById('profileName');
const profileSurname  = document.getElementById('profileSurname');
const profileVerified = document.getElementById('profileVerified');
const profileCreated  = document.getElementById('profileCreated');
const profileAccess   = document.getElementById('profileAccess');

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
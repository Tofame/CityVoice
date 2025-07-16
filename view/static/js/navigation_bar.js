document.addEventListener('DOMContentLoaded', () => {
    console.log("Navigation bar.js loaded");
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

function goToLink(link) {
    window.location.href = link;
}

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

async function updateUI() {
    const token = localStorage.getItem('token');

    // Hide admin panel button
    nb_adminPanelBtn.classList.add("hidden");

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
                nb_userInfoBtn.textContent = tmpText;
                showProfile = true;
                // Name not available, setting user id
            } else if(userProfile.user_id) {
                nb_userInfoBtn.textContent = 'User ' + userProfile.user_id;
                showProfile = true;
                // There is profile but neither ID nor Name (that should never happen, would be a bug)
            } else {
                nb_userInfoBtn.textContent = '??? User';
            }
        } else {
            nb_userInfoBtn.textContent = 'Unknown User';
        }
        nb_loginBtn.classList.add('hidden');
        nb_logoutBtn.classList.remove('hidden');
        if(showProfile === true) {
            nb_userInfoBtn.click(); // shows user profile basically
        }

        // Show admin panel button
        if(AccessLevel[userProfile.access] === "Admin") {
            nb_adminPanelBtn.classList.remove("hidden");
        }
    } else {
        nb_userInfoBtn.textContent = 'Guest';
        nb_loginBtn.classList.remove('hidden');
        nb_logoutBtn.classList.add('hidden');
    }
}
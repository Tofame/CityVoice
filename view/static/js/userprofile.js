document.addEventListener('DOMContentLoaded', () => {
    updateUI_UserProfile();
});

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

async function updateUI_UserProfile() {
    const token = localStorage.getItem('token');

    // Hide admin panel button
    nb_adminPanelBtn.classList.add("hidden");

    if (!token) {
        nb_userInfoBtn.textContent = 'Guest';
        nb_loginBtn.classList.remove('hidden');
        nb_logoutBtn.classList.add('hidden');
        return;
    }

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
}
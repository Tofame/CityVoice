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

const ProjectCategory = {
    0: "Unknown Category",
    1: "Culture and Arts",
    2: "Healthcare and Social assistance",
    3: "Community Integration",
    4: "Greenery and Nature",
    5: "Education",
    6: "Sports and Recreation",
    7: "Public Infrastructure",
    8: "Road Infrastructure",
    9: "Environmental Protection",
    10: "Other"
};

function getIntKeyByValue(obj, value) {
    return parseInt(Object.keys(obj).find(key => obj[key] === value));
}

const ProjectDistrict = {
    0: "Unknown District",
    1: "Riverside",
    2: "Northgate",
    3: "Old Town",
    4: "Greenfield",
    5: "Westmoor",
    6: "Lakeside",
    7: "Sunset Heights",
    8: "Hillcrest",
    9: "Maplewood",
    10: "Downtown Core",
    11: "Brookstone",
    12: "Southbridge",
    13: "Ironwood",
    14: "Eastbay",
    15: "Silvergrove",
    16: "Crescent Hollow"
};

// Admin Panel config
let currentUserPage = 1;
const usersPerPage = 10;
let currentProjectPage = 1;
const projectsPerPage = 10;

// Helper method to trim string
function trimString(text, maxLength = 30) {
    if (!text) return null;
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

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

function getAuthToken() {
    return localStorage.getItem('token');
}

function getCurrentUserIdFromToken() {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return String(decoded.user_id);
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        return null;
    }
}
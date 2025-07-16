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
    0: "Culture and Arts",
    1: "Healthcare and Social assistance",
    2: "Community Integration",
    3: "Greenery and Nature",
    4: "Education",
    5: "Sports and Recreation",
    6: "Public Infrastructure",
    7: "Road Infrastructure",
    8: "Environmental Protection",
    9: "Other"
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
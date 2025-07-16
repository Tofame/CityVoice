const switchToRegisterForm = document.getElementById('switchToRegisterForm');
const switchToLoginForm = document.getElementById('switchToLoginForm');

document.addEventListener('DOMContentLoaded', () => {
    console.log("Home.js loaded");
});

switchToRegisterForm.onclick = () => {
    hideLoginForm();
    showRegisterForm();
};

switchToLoginForm.onclick = () => {
    hideRegisterForm();
    showLoginForm();
};
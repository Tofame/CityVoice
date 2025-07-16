document.addEventListener('DOMContentLoaded', () => {
    console.log("Home.js loaded");
});

// Main Page Stuff
const mainContent = document.getElementById('mainContent');
const newsletterForm = document.getElementById('newsletterForm');

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
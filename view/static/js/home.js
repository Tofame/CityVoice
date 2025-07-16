const newsletterForm = document.getElementById('newsletterForm');

document.addEventListener('DOMContentLoaded', () => {
    console.log("Home.js loaded");
    fetchFeaturedProjects();
});

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

async function fetchFeaturedProjects() {
    try {
        const statusAcceptedKey = Object.keys(ProjectStatus).find(key => ProjectStatus[key] === "Accepted");
        const res = await fetch(`/project?page=1&limit=3&order=most_popular_up&status=${statusAcceptedKey}`, {
            method: 'GET'
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch projects');
        }

        renderFeaturedProjects(data.projects);
    } catch (err) {
        console.error('Error loading featured projects:', err);
        document.getElementById('featured_projects_list').innerHTML = `
            <p class="text-red-500 col-span-full text-center">Could not load featured projects.</p>
        `;
    }
}
function renderFeaturedProjects(projects) {
    const container = document.getElementById('featured_projects_list');
    container.innerHTML = ''; // clear existing static content

    if (!projects.length) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects found.</p>';
        return;
    }

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        card.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${trimString(project.description, 90) || 'No description provided.'}</p>
            <a href="/project/${project.project_id}" class="project-link">View project</a>
        `;

        container.appendChild(card);
    });
}
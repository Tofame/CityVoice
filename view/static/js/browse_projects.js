const yearFilter = document.getElementById('yearFilter');
const statusFilter = document.getElementById('statusFilter');
const categoriesFilter = document.getElementById('categoriesFilter');
const districtFilter = document.getElementById('districtFilter');

const pageSizeSelect = document.getElementById('pageSize');
const searchInput = document.querySelector('input[placeholder="Search projects..."]');
const projectsList = document.getElementById('projectsList');
const noProjects = document.getElementById('noProjects');

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');

const projectsCount = document.getElementById('projectsCount');
let currentPage = 1;

// Populate filters
const currentYear = new Date().getFullYear();
for (let i = 0; i < 6; i++) {
    const year = currentYear - i;
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
}

for (const key in ProjectStatus) {
    // Let's not include 'Pending' status
    if(key === "0") {
        continue;
    }

    if (ProjectStatus.hasOwnProperty(key)) {
        const valueText = ProjectStatus[key];
        const option = document.createElement("option");
        option.value = key;
        option.textContent = valueText;
        statusFilter.appendChild(option);
    }
}

for (const key in ProjectCategory) {
    // Let's not include 'Unknown Category' status
    if(key === "0") {
        continue;
    }

    if (ProjectCategory.hasOwnProperty(key)) {
        const valueText = ProjectCategory[key];
        const option = document.createElement("option");
        option.value = key;
        option.textContent = valueText.replace(/_/g, ' ');
        categoriesFilter.appendChild(option);
    }
}

for (const key in ProjectDistrict) {
    // Let's not include Unknown District
    if(key === "0") {
        continue;
    }

    if (ProjectDistrict.hasOwnProperty(key)) {
        const valueText = ProjectDistrict[key];
        const option = document.createElement("option");
        option.value = key;
        option.textContent = valueText;
        districtFilter.appendChild(option);
    }
}

// -------------- Rendering projects now :P
function fetchProjects() {
    const limit = pageSizeSelect.value;
    const search = searchInput.value.trim();
    const category = categoriesFilter.value;
    const status = statusFilter.value;
    const district = districtFilter.value;
    const year = yearFilter.value;

    let params = new URLSearchParams({
        page: currentPage,
        limit
    });

    if (search) params.append("search", search);
    if (category && category !== "Category") params.append("category", category);
    if (status && status !== "Status") params.append("status", status);
    if (district && district !== "District") params.append("district", district);
    if (year && year !== "Year") {
        params.append("created_after", `${year}-01-01`);
        params.append("created_before", `${year}-12-31`);
    }

    fetch(`/api/project?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            renderProjects(data.projects);
            projectsCount.textContent = "Total Projects: " + data.total;
        })
        .catch(err => {
            console.error("Failed to fetch projects", err);
        });
}

function renderProjects(projects) {
    projectsList.innerHTML = '';
    if (!projects || projects.length === 0) {
        noProjects.classList.remove('hidden');
        return;
    }

    noProjects.classList.add('hidden');

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = `
            bg-white rounded-lg shadow-md p-6 flex flex-col justify-between
            border border-gray-100 hover:shadow-lg transition-all duration-200
            cursor-pointer
        `;
        projectCard.onclick = () => {
            // Assuming a detail page route like /projects/:id
            window.location.href = `/projects/${project.id}`;
        };

        const statusText = ProjectStatus[project.status] || 'Unknown Status';
        const categoryText = ProjectCategory[project.category] ? ProjectCategory[project.category].replace(/_/g, ' ') : 'Unknown Category';
        const districtText = ProjectDistrict[project.district] || 'Unknown District';
        const costText = project.cost !== undefined && project.cost !== null ? project.cost + ' PLN' : '0 PLN';

        const upvotes = project.votes_up || 0;
        const downvotes = project.votes_down || 0;

        projectCard.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <h3 class="text-xl font-bold text-gray-900">${project.title || 'Untitled Project'}</h3>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                    <div class="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <span>${upvotes}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>${downvotes}</span>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-500 mb-3">${districtText}</p>
            <p class="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">${project.description || 'No description provided.'}</p>
        
            <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Category: ${categoryText}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                        Status: ${statusText}
                    </span>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-blue-700">${costText}</div>
                </div>
            </div>
        `;
        projectsList.appendChild(projectCard);
    });
}

// Event listeners
[yearFilter, statusFilter, categoriesFilter, districtFilter, pageSizeSelect].forEach(el => {
    el.addEventListener('change', () => {
        currentPage = 1;
        fetchProjects();
    });
});

searchInput.addEventListener('input', debounce(() => {
    currentPage = 1;
    fetchProjects();
}, 300));

function debounce(fn, delay) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(fn, delay);
    };
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        currentPageSpan.textContent = currentPage;
        fetchProjects();
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    currentPageSpan.textContent = currentPage;
    fetchProjects();
});

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
});
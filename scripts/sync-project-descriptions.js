document.addEventListener('DOMContentLoaded', function() {
    // Map of project URLs to their corresponding elements on the index page
    const projectMap = {
        'league-console': 'League Console',
        'restaurant-delivery': 'Restaurant Delivery Application',
        'in-store-mobile': 'In-Store Mobile Experience',
        'support-portal': 'Customer Support Portal',
        'website-redesign': 'Website Redesign',
        'ewallet': 'eWallet Feature',
        'restaurant-dashboard': 'Restaurant Performance Dashboard',
        'go-sandbox': 'Go Sandbox',
        'ar-packaging': 'Interactive Hat Box',
        'recipe-book': 'Digital Recipe Book'
    };

    // Function to fetch and extract subtitle from a project page
    async function fetchProjectSubtitle(projectKey) {
        try {
            const response = await fetch(`projects/${projectKey}.html`);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const subtitle = doc.querySelector('.project-subtitle');
            return subtitle ? subtitle.textContent : null;
        } catch (error) {
            console.error(`Error fetching subtitle for ${projectKey}:`, error);
            return null;
        }
    }

    // Function to update project info on the index page
    function updateProjectInfo(projectKey, subtitle) {
        const projectTitle = projectMap[projectKey];
        const projectLinks = document.querySelectorAll('.project');
        
        for (const link of projectLinks) {
            const titleElement = link.querySelector('h3');
            if (titleElement && titleElement.textContent === projectTitle) {
                const infoElement = link.querySelector('.project-info p');
                if (infoElement && subtitle) {
                    infoElement.textContent = subtitle;
                }
                break;
            }
        }
    }

    // Update all project descriptions
    async function updateAllProjectDescriptions() {
        for (const projectKey of Object.keys(projectMap)) {
            const subtitle = await fetchProjectSubtitle(projectKey);
            if (subtitle) {
                updateProjectInfo(projectKey, subtitle);
            }
        }
    }

    // Only run on the index page
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        updateAllProjectDescriptions();
    }
}); 
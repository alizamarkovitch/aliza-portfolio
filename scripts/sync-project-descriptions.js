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

    // Function to update project info on the index page
    function updateProjectInfo(projectKey) {
        const projectTitle = projectMap[projectKey];
        const description = projectDescriptions[projectKey];
        const projectLinks = document.querySelectorAll('.project');
        
        for (const link of projectLinks) {
            const titleElement = link.querySelector('h3');
            if (titleElement && titleElement.textContent === projectTitle) {
                const infoElement = link.querySelector('.project-info p');
                if (infoElement && description) {
                    infoElement.textContent = description;
                }
                break;
            }
        }
    }

    // Update all project descriptions
    function updateAllProjectDescriptions() {
        for (const projectKey of Object.keys(projectMap)) {
            updateProjectInfo(projectKey);
        }
    }

    // Only run on the index page
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        updateAllProjectDescriptions();
    }
}); 
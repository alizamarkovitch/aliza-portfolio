// Function to get footer HTML
function getFooterHTML(isProjectPage) {
    const basePath = isProjectPage ? '../' : './';
    return `
        <footer class="project-footer">
            <div class="footer-content">
                <a href="${basePath}index.html" class="footer-profile">
                    <div class="footer-profile-image">
                        <img src="${basePath}assets/images/profile/profile.jpg" alt="Aliza">
                    </div>
                    <span>Aliza</span>
                </a>
                <p>© 2024 Aliza. All rights reserved.</p>
                <div class="social-links">
                    <a href="https://www.linkedin.com/in/alizam" target="_blank" rel="noopener noreferrer" class="linkedin-link">
                        <i class="fab fa-linkedin"></i> www.linkedin.com/in/alizam
                    </a>
                </div>
            </div>
        </footer>
    `;
}

// Function to load the footer
function loadFooter() {
    try {
        console.log('Loading footer...');
        
        // Get the current path and check if we're on a project page
        const path = window.location.pathname;
        const isProjectPage = path.includes('/projects/');
        
        // Find the layout container
        const layoutDiv = document.querySelector('.layout');
        if (!layoutDiv) {
            throw new Error('Layout container not found');
        }

        // Remove any existing footer
        const existingFooter = document.querySelector('.project-footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        // Create a temporary container
        const temp = document.createElement('div');
        temp.innerHTML = getFooterHTML(isProjectPage);
        
        // Get the footer element
        const footerElement = temp.firstElementChild;
        if (!footerElement) {
            throw new Error('Footer element not found');
        }

        // Insert the footer at the end of the layout
        layoutDiv.appendChild(footerElement);

        // Apply styles to ensure footer visibility
        layoutDiv.style.display = 'flex';
        layoutDiv.style.flexDirection = 'column';
        layoutDiv.style.minHeight = '100vh';

        const mainContent = layoutDiv.querySelector('main');
        if (mainContent) {
            mainContent.style.flex = '1 0 auto';
        }

        // Style the footer
        footerElement.style.flexShrink = '0';
        footerElement.style.width = '100%';
        footerElement.style.marginTop = 'auto';
        footerElement.style.display = 'block';
        
        console.log('Footer loaded and inserted successfully');
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Load the footer when the script runs
loadFooter(); 
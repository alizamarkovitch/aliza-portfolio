document.addEventListener('DOMContentLoaded', function() {
    // Create the button element
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollButton);

    // Show/hide button based on scroll position
    function toggleScrollButton() {
        const scrollPosition = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const quarterPage = (pageHeight - viewportHeight) * 0.25;

        if (scrollPosition > quarterPage) {
            scrollButton.style.display = 'flex';
        } else {
            scrollButton.style.display = 'none';
        }
    }

    // Scroll to top when button is clicked
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Listen for scroll events
    window.addEventListener('scroll', toggleScrollButton);
    
    // Initial check for button visibility
    toggleScrollButton();
}); 
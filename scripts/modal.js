document.addEventListener('DOMContentLoaded', function() {
    // Get the modal
    var modal = document.getElementById('imageModal');
    var modalImg = document.getElementById('modalImage');
    var modalCaption = document.getElementById('modalCaption');

    // Get all images in media containers
    var images = document.querySelectorAll('.media-container img');

    // Add click event to all images
    images.forEach(function(img) {
        img.onclick = function() {
            modal.style.display = 'block';
            modalImg.src = this.src;
            var caption = this.closest('.media-container').querySelector('.media-caption p');
            modalCaption.innerHTML = caption ? caption.innerHTML : '';
        }
    });

    // Close modal when clicking the modal image
    modalImg.onclick = function(event) {
        event.stopPropagation(); // Prevent event from bubbling to modal
        modal.style.display = 'none';
    }

    // Close modal when clicking outside the image (on the dark overlay)
    modal.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal with escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});
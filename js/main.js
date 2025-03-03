document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Close mobile menu if open
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
      }
    });
  });

  // Add animation to projects on scroll
  const projects = document.querySelectorAll(".project");

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        projectObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  projects.forEach((project) => {
    project.style.opacity = "0";
    project.style.transform = "translateY(20px)";
    project.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    projectObserver.observe(project);
  });
});

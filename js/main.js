// Dynamic Copyright Year
const copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// Service Area Dialog
const serviceAreaTrigger = document.querySelector('.service-area-trigger');
const serviceAreaDialog = document.getElementById('service-area-dialog');
const dialogClose = document.querySelector('.dialog-close');

if (serviceAreaTrigger && serviceAreaDialog) {
    serviceAreaTrigger.addEventListener('click', function() {
        serviceAreaDialog.showModal();
    });

    dialogClose.addEventListener('click', function() {
        serviceAreaDialog.close();
    });

    serviceAreaDialog.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            serviceAreaDialog.close();
        }
    });

    serviceAreaDialog.addEventListener('click', function(e) {
        if (e.target === serviceAreaDialog) {
            serviceAreaDialog.close();
        }
    });
}

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');
const navLinks = nav.querySelectorAll('a');

if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.setAttribute('aria-expanded', 'false');
            nav.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !nav.contains(event.target)) {
            hamburger.setAttribute('aria-expanded', 'false');
            nav.classList.remove('active');
        }
    });
}

// Job Listings
function renderJobs() {
    const jobsList = document.getElementById('jobs-list');
    if (!jobsList || typeof jobs === 'undefined') return;

    const activeJobs = jobs.filter(job => job.active === true);

    if (activeJobs.length === 0) {
        jobsList.innerHTML = '<p class="jobs-empty">We\'re not currently hiring, but check back for future opportunities.</p>';
        return;
    }

    let jobsHTML = '';
    activeJobs.forEach(job => {
        jobsHTML += `
            <div class="job-item">
                <div class="job-title">${job.title}</div>
                <div class="job-detail">
                    <span class="job-detail-label">Schedule:</span> ${job.schedule}
                </div>
                <div class="job-detail">
                    <span class="job-detail-label">Requirements:</span> ${job.requirements}
                </div>
                <div class="job-detail">
                    <span class="job-detail-label">${job.applyInstructions}</span>
                </div>
                <div><a href="mailto:${job.applyEmail}">${job.applyEmail}</a></div>
            </div>
        `;
    });
    jobsList.innerHTML = jobsHTML;
}

// Initialize jobs on page load
renderJobs();

// Review Carousel
const carouselTrack = document.getElementById('carousel-track');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');

if (carouselTrack && carouselPrev && carouselNext) {
    let currentIndex = 0;
    const reviewItems = carouselTrack.querySelectorAll('.review-item');
    const reviewCount = reviewItems.length;

    function updateCarousel() {
        // On mobile (1 column), show 1 review at a time
        // On desktop (2 columns), show 2 reviews at a time
        const itemsToShow = window.innerWidth < 1024 ? 1 : 2;

        // Calculate scroll position
        const scrollAmount = currentIndex * (100 / itemsToShow);
        carouselTrack.style.transform = `translateX(${-scrollAmount}%)`;

        // Update button states
        carouselPrev.disabled = currentIndex === 0;
        carouselNext.disabled = currentIndex >= reviewCount - itemsToShow;

        if (currentIndex === 0) carouselPrev.style.opacity = '0.5';
        else carouselPrev.style.opacity = '1';

        if (currentIndex >= reviewCount - itemsToShow) carouselNext.style.opacity = '0.5';
        else carouselNext.style.opacity = '1';
    }

    carouselPrev.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    carouselNext.addEventListener('click', function() {
        const itemsToShow = window.innerWidth < 1024 ? 1 : 2;
        if (currentIndex < reviewCount - itemsToShow) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Handle window resize to adjust carousel
    window.addEventListener('resize', function() {
        const itemsToShow = window.innerWidth < 1024 ? 1 : 2;
        if (currentIndex >= reviewCount - itemsToShow) {
            currentIndex = Math.max(0, reviewCount - itemsToShow);
        }
        updateCarousel();
    });

    // Initialize carousel
    updateCarousel();
}

// Back to Top Paw Print Button
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
    // Show/hide button based on scroll position
    const scrollThreshold = 300; // Show after scrolling 300px

    function updateBackToTopVisibility() {
        if (window.scrollY > scrollThreshold) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    backToTopButton.addEventListener('click', function() {
        if (prefersReducedMotion) {
            // No smooth scroll if reduced motion is preferred
            window.scrollTo(0, 0);
        } else {
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // Update visibility on scroll
    window.addEventListener('scroll', updateBackToTopVisibility);

    // Initialize visibility state
    updateBackToTopVisibility();
}

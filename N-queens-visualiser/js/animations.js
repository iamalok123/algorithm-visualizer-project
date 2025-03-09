// Smooth scroll animation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const fadeElements = document.querySelectorAll('.animate-card, .animate-text, .animate-title');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    fadeObserver.observe(element);
});

// Button hover effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });

    button.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
});

// Chess piece hover animation
document.querySelectorAll('.chess-piece').forEach(piece => {
    piece.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.2)';
        this.style.transition = 'transform 0.3s ease-out';
    });

    piece.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
});

// Solution item hover animation
document.querySelectorAll('.solution-item').forEach(item => {
    item.addEventListener('mouseover', function() {
        this.style.transform = 'translateX(10px)';
        this.style.backgroundColor = '#e9ecef';
        this.style.transition = 'all 0.3s ease-out';
    });

    item.addEventListener('mouseout', function() {
        this.style.transform = 'translateX(0)';
        this.style.backgroundColor = '#f8f9fa';
    });
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.className = 'ripple';
    
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }
    
    button.appendChild(ripple);
}

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add loading spinner animation
function showLoadingSpinner(element) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    element.appendChild(spinner);
    return spinner;
}

function hideLoadingSpinner(spinner) {
    if (spinner && spinner.parentElement) {
        spinner.parentElement.removeChild(spinner);
    }
}

// Add page transition animations
function addPageTransition() {
    const content = document.querySelector('main');
    content.classList.add('page-enter');
    
    requestAnimationFrame(() => {
        content.classList.add('page-enter-active');
        content.classList.remove('page-enter');
    });
}

// Initialize animations when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addPageTransition();
}); 
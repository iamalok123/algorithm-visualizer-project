document.addEventListener('DOMContentLoaded', () => {
    // Initialize page transitions
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const page = card.dataset.page;
            navigateToPage(page);
        });
    });

    // Handle smooth navigation
    function navigateToPage(page) {
        const container = document.querySelector('.container');
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            window.location.href = `pages/${page}.html`;
        }, 300);
    }

    // Add hover effects
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const btn = card.querySelector('.explore-btn');
            btn.style.transform = 'scale(1.1)';
        });

        card.addEventListener('mouseleave', (e) => {
            const btn = card.querySelector('.explore-btn');
            btn.style.transform = 'scale(1)';
        });
    });

    // Add intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.card').forEach((el) => observer.observe(el));
}); 
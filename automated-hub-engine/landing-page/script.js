/**
 * Automated Hub Engine - Landing Page JavaScript
 * Professional interactions and form handling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeScrollEffects();
    initializeContactForm();
    initializeDemoVideo();
    initializeAnimations();
    initializeMetrics();
    
    console.log('🚀 Automated Hub Engine landing page initialized');
});

// ==================== NAVIGATION ==================== //

function initializeNavigation() {
    const nav = document.querySelector('.nav');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Scroll behavior for navigation
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add backdrop blur and shadow on scroll
        if (currentScrollY > 100) {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(10px)';
            nav.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(10px)';
            nav.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Mobile menu toggle
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-links-open');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== SCROLL EFFECTS ==================== //

function initializeScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .metric-card')
        .forEach(el => observer.observe(el));
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('.hero-visual');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        });
    }
}

// ==================== CONTACT FORM ==================== //

function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = `
            <svg class="animate-spin btn-icon" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
        `;
        submitButton.disabled = true;
        
        try {
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success handling
            showFormSuccess();
            
            // Track conversion
            trackConversion('form_submit', data);
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showFormError('Something went wrong. Please try again or contact us directly.');
        } finally {
            // Restore button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(e);
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('field-error');
}

function showFieldError(field, message) {
    field.classList.add('field-error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #DC2626;
        font-size: 0.875rem;
        margin-top: 0.5rem;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function showFormSuccess() {
    const notification = createNotification(
        'Success!',
        'Thank you for your interest. We\'ll be in touch within 24 hours to set up your free trial.',
        'success'
    );
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showFormError(message) {
    const notification = createNotification(
        'Error',
        message,
        'error'
    );
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function createNotification(title, message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#059669' : '#DC2626'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 0.5rem;">${title}</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">${message}</div>
    `;
    
    return notification;
}

// ==================== DEMO VIDEO ==================== //

function initializeDemoVideo() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (!videoPlaceholder) return;
    
    videoPlaceholder.addEventListener('click', function() {
        // Track demo view
        trackConversion('demo_view', { source: 'landing_page' });
        
        // Replace with actual video (YouTube embed, Vimeo, or direct video)
        const videoContainer = this.parentNode;
        videoContainer.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="width: 100%; height: 100%; border-radius: 0.5rem;">
            </iframe>
        `;
    });
}

// ==================== ANIMATIONS ==================== //

function initializeAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        
        .field-error {
            border-color: #DC2626 !important;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        
        .notification {
            animation: slideInRight 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Stagger animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Counter animation for metrics
    animateCounters();
}

function animateCounters() {
    const counters = document.querySelectorAll('.metric-value, .metric-card-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent;
    const hasPercentage = text.includes('%');
    const hasPlus = text.includes('+');
    const number = parseFloat(text.replace(/[^\d.]/g, ''));
    
    if (isNaN(number)) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = number / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (text.includes('K')) displayValue += 'K';
        if (hasPercentage) displayValue += '%';
        if (hasPlus) displayValue += '+';
        if (text.includes('min')) displayValue += 'min';
        
        element.textContent = displayValue;
    }, duration / steps);
}

// ==================== METRICS & TRACKING ==================== //

function initializeMetrics() {
    // Track page view
    trackConversion('page_view', {
        page: 'landing',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    const trackingPoints = [25, 50, 75, 90, 100];
    
    window.addEventListener('scroll', throttle(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = Math.round((window.scrollY / scrollHeight) * 100);
        
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            
            trackingPoints.forEach(point => {
                if (scrollDepth >= point && maxScrollDepth < point + 5) {
                    trackConversion('scroll_depth', { depth: point });
                }
            });
        }
    }, 1000));
    
    // Track button clicks
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const href = this.getAttribute('href');
            
            trackConversion('button_click', {
                button_text: buttonText,
                href: href,
                section: getElementSection(this)
            });
        });
    });
    
    // Track feature card hovers (engagement)
    document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
        let hoverStartTime;
        
        card.addEventListener('mouseenter', () => {
            hoverStartTime = Date.now();
        });
        
        card.addEventListener('mouseleave', () => {
            if (hoverStartTime) {
                const hoverDuration = Date.now() - hoverStartTime;
                if (hoverDuration > 2000) { // Only track if hovered for 2+ seconds
                    const cardType = card.classList.contains('feature-card') ? 'feature' : 'pricing';
                    const cardTitle = card.querySelector('h3')?.textContent || 'unknown';
                    
                    trackConversion('card_engagement', {
                        card_type: cardType,
                        card_title: cardTitle,
                        hover_duration: hoverDuration
                    });
                }
            }
        });
    });
}

function trackConversion(event, data = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            custom_parameter: JSON.stringify(data),
            ...data
        });
    }
    
    // Segment tracking
    if (typeof analytics !== 'undefined') {
        analytics.track(event, {
            ...data,
            product: 'Automated Hub Engine',
            page: 'landing',
            timestamp: new Date().toISOString()
        });
    }
    
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Tracked conversion:', event, data);
    }
    
    // Custom analytics endpoint
    if (window.AHE_ANALYTICS_ENDPOINT) {
        fetch(window.AHE_ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event,
                data,
                session_id: getSessionId(),
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.warn('Analytics tracking failed:', err));
    }
}

// ==================== UTILITY FUNCTIONS ==================== //

function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function(...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

function getElementSection(element) {
    const sections = ['hero', 'features', 'social-proof', 'pricing', 'demo', 'contact'];
    let currentSection = 'unknown';
    
    let parent = element;
    while (parent && parent !== document.body) {
        const classList = Array.from(parent.classList || []);
        const sectionFound = sections.find(section => classList.includes(section));
        if (sectionFound) {
            currentSection = sectionFound;
            break;
        }
        parent = parent.parentNode;
    }
    
    return currentSection;
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('ahe_session_id');
    if (!sessionId) {
        sessionId = 'ahe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('ahe_session_id', sessionId);
    }
    return sessionId;
}

// ==================== INTERSECTION OBSERVER POLYFILL ==================== //

// Simple polyfill for older browsers
if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
        constructor(callback) {
            this.callback = callback;
            this.elements = [];
        }
        
        observe(element) {
            this.elements.push(element);
            // Trigger immediately for fallback
            this.callback([{ target: element, isIntersecting: true }]);
        }
        
        unobserve(element) {
            const index = this.elements.indexOf(element);
            if (index > -1) {
                this.elements.splice(index, 1);
            }
        }
    };
}

// ==================== ERROR HANDLING ==================== //

window.addEventListener('error', function(e) {
    console.error('Landing page error:', e.error);
    
    // Track errors for debugging
    trackConversion('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack
    });
});

// ==================== PERFORMANCE MONITORING ==================== //

window.addEventListener('load', function() {
    // Measure page load performance
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        trackConversion('page_performance', {
            load_time: loadTime,
            dom_ready: timing.domContentLoadedEventEnd - timing.navigationStart,
            first_paint: window.performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-paint')?.startTime || null
        });
    }
});

// ==================== ACCESSIBILITY ENHANCEMENTS ==================== //

// Keyboard navigation for mobile menu
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const mobileMenu = document.querySelector('.nav-links-open');
        if (mobileMenu) {
            mobileMenu.classList.remove('nav-links-open');
            document.querySelector('.mobile-menu-toggle').classList.remove('active');
        }
    }
});

// Skip to content link for screen readers
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #2563EB;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 1001;
    border-radius: 4px;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// Add main content landmark
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.id = 'main-content';
    heroSection.setAttribute('role', 'main');
}

console.log('✅ Automated Hub Engine landing page fully loaded and ready');
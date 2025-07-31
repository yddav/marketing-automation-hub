// Untrapd Hub - Main JavaScript
// Professional device security meets premium automotive design

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeForms();
    initializeAnalytics();
    console.log('🔒 Untrapd Hub initialized successfully');
});

// Navigation Functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Active navigation highlighting
    updateActiveNavigation();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

// Update active navigation based on scroll position
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.pageYOffset + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Enhanced Scroll Effects
function initializeScrollEffects() {
    // Professional header behavior on scroll
    const header = document.querySelector('.main-header');
    let scrolled = false;
    
    window.addEventListener('scroll', function() {
        const shouldAddClass = window.scrollY > 80;
        
        if (shouldAddClass && !scrolled) {
            header.classList.add('scrolled');
            scrolled = true;
        } else if (!shouldAddClass && scrolled) {
            header.classList.remove('scrolled');
            scrolled = false;
        }
    });
    
    // Professional Intersection Observer for animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Professional scroll animations for all cards and sections
    const animateElements = document.querySelectorAll(`
        .feature-card, 
        .integration-step, 
        .pricing-card, 
        .testimonial-card,
        .showcase-item,
        .faq-item
    `);
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Form Handling
function initializeForms() {
    // Waitlist form
    const waitlistForm = document.querySelector('.waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', handleWaitlistSubmission);
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }
}

// Waitlist form submission
function joinWaitlist(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitButton.innerHTML = 'Joining...';
    submitButton.disabled = true;
    form.classList.add('loading');
    
    // Simulate API call (replace with actual Supabase/Mailchimp integration)
    setTimeout(() => {
        if (validateEmail(email)) {
            // Success
            showFormSuccess(form, 'Successfully joined waitlist! We\'ll notify you when AppFinder launches.');
            
            // Track conversion
            trackEvent('waitlist_signup', {
                email: email,
                source: 'homepage',
                timestamp: new Date().toISOString()
            });
            
            // Reset form
            form.reset();
        } else {
            showFormError(form, 'Please enter a valid email address.');
        }
        
        // Reset button
        submitButton.innerHTML = 'Join Waitlist';
        submitButton.disabled = false;
        form.classList.remove('loading');
    }, 1500);
}

// Newsletter subscription
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitButton.innerHTML = 'Subscribing...';
    submitButton.disabled = true;
    form.classList.add('loading');
    
    // Simulate API call (replace with actual Mailchimp integration)
    setTimeout(() => {
        if (validateEmail(email)) {
            // Success
            showFormSuccess(form, 'Successfully subscribed! Welcome to the Untrapd community.');
            
            // Track conversion
            trackEvent('newsletter_signup', {
                email: email,
                source: 'homepage_footer',
                timestamp: new Date().toISOString()
            });
            
            // Reset form
            form.reset();
        } else {
            showFormError(form, 'Please enter a valid email address.');
        }
        
        // Reset button
        submitButton.innerHTML = 'Subscribe';
        submitButton.disabled = false;
        form.classList.remove('loading');
    }, 1500);
}

// Form validation and utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormSuccess(form, message) {
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'form-message success';
    successDiv.textContent = message;
    form.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showFormError(form, message) {
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-message error';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// App Download Tracking
function trackDownload(platform) {
    trackEvent('app_download_attempt', {
        platform: platform,
        source: 'homepage',
        timestamp: new Date().toISOString()
    });
    
    // Show coming soon message for now
    alert(`AppFinder for ${platform} is coming soon! Join our waitlist to be notified when it launches.`);
    
    // Scroll to waitlist form
    const waitlistSection = document.getElementById('appfinder-download');
    if (waitlistSection) {
        waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Analytics and Tracking
function initializeAnalytics() {
    // Track page view
    trackEvent('page_view', {
        page: 'homepage',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', function() {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            
            // Track major scroll milestones
            if (maxScrollDepth >= 25 && !window.tracked25) {
                trackEvent('scroll_depth', { depth: 25 });
                window.tracked25 = true;
            }
            if (maxScrollDepth >= 50 && !window.tracked50) {
                trackEvent('scroll_depth', { depth: 50 });
                window.tracked50 = true;
            }
            if (maxScrollDepth >= 75 && !window.tracked75) {
                trackEvent('scroll_depth', { depth: 75 });
                window.tracked75 = true;
            }
            if (maxScrollDepth >= 90 && !window.tracked90) {
                trackEvent('scroll_depth', { depth: 90 });
                window.tracked90 = true;
            }
        }
    });
    
    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackEvent('time_on_page', {
            duration: timeOnPage,
            max_scroll_depth: maxScrollDepth
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('.cta-button, .feature-link').forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('cta_click', {
                cta_text: this.textContent.trim(),
                cta_location: this.closest('section')?.className || 'unknown',
                href: this.href || this.getAttribute('onclick') || 'unknown'
            });
        });
    });
}

// Event tracking function (replace with actual analytics service)
function trackEvent(eventName, properties = {}) {
    // For now, log to console
    console.log('📊 Analytics Event:', eventName, properties);
    
    // TODO: Replace with actual analytics service (Google Analytics, Mixpanel, etc.)
    // Example for Google Analytics 4:
    // gtag('event', eventName, properties);
    
    // Example for Mixpanel:
    // mixpanel.track(eventName, properties);
    
    // Store in localStorage for now (for debugging/development)
    const events = JSON.parse(localStorage.getItem('untrapd_events') || '[]');
    events.push({
        event: eventName,
        properties: properties,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 events to prevent storage bloat
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('untrapd_events', JSON.stringify(events));
}

// Privacy Policy Modal
function showPrivacyPolicy() {
    const modal = createModal('Privacy Policy', `
        <div class="privacy-content">
            <h3>Privacy Policy</h3>
            <p><strong>Last updated:</strong> January 2025</p>
            
            <h4>Information We Collect</h4>
            <p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us.</p>
            
            <h4>How We Use Your Information</h4>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and comply with legal obligations.</p>
            
            <h4>Information Sharing</h4>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
            
            <h4>Security</h4>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            
            <h4>Contact Us</h4>
            <p>If you have questions about this Privacy Policy, please contact us at privacy@untrapd.com</p>
        </div>
    `);
    
    trackEvent('privacy_policy_viewed');
}

// Terms of Service Modal
function showTerms() {
    const modal = createModal('Terms of Service', `
        <div class="terms-content">
            <h3>Terms of Service</h3>
            <p><strong>Last updated:</strong> January 2025</p>
            
            <h4>Acceptance of Terms</h4>
            <p>By accessing and using Untrapd services, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h4>Use License</h4>
            <p>Permission is granted to temporarily use Untrapd services for personal, non-commercial transitory viewing only.</p>
            
            <h4>Disclaimer</h4>
            <p>The materials on Untrapd's services are provided on an 'as is' basis. Untrapd makes no warranties, expressed or implied.</p>
            
            <h4>Limitations</h4>
            <p>In no event shall Untrapd or its suppliers be liable for any damages arising out of the use or inability to use the materials on our services.</p>
            
            <h4>Contact Us</h4>
            <p>If you have questions about these Terms, please contact us at legal@untrapd.com</p>
        </div>
    `);
    
    trackEvent('terms_of_service_viewed');
}

// Modal utility function
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 2rem;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border-radius: 12px;
        position: relative;
    `;
    
    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    `;
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.cssText = `
        padding: 1.5rem;
    `;
    
    const closeButton = modal.querySelector('.modal-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
    return modal;
}

// Performance monitoring
window.addEventListener('load', function() {
    // Track page load performance
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        trackEvent('page_performance', {
            load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
            first_paint: Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0)
        });
    }
});

// Error tracking
window.addEventListener('error', function(e) {
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack
    });
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when service worker is implemented
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}
/**
 * Dashboard Authentication System
 * Secure access control using Supabase Auth
 *
 * UNTRAPD Ecosystem - Analytics Dashboard
 */

// Supabase Configuration
const SUPABASE_URL = 'https://zdceeulkqfpzdjeyekgs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UOURsZSevFyKJJljIO9FDg_In2B0hdv';

// Initialize Supabase client (use different name to avoid conflicts)
const supabaseAuth = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Allowed users whitelist (email addresses that can access the dashboard)
// Add your email(s) here
const ALLOWED_USERS = [
    'untrapd77@gmail.com',
    'e.linetools@gmail.com',
    // Add more allowed emails as needed
];

// Dashboard Auth Controller
const DashboardAuth = {
    /**
     * Initialize auth system
     */
    async init() {
        // Check if we're on the login page or dashboard
        const isLoginPage = window.location.pathname.includes('login.html');

        if (isLoginPage) {
            this.initLoginPage();
        } else {
            await this.checkAuth();
        }

        // Listen for auth state changes
        supabaseAuth.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_IN' && session) {
                this.handleSignIn(session);
            } else if (event === 'SIGNED_OUT') {
                this.redirectToLogin();
            }
        });
    },

    /**
     * Initialize login page functionality
     */
    initLoginPage() {
        // Check if already logged in
        this.checkExistingSession();

        // Google Sign-In button
        const googleBtn = document.getElementById('googleSignIn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // Magic Link form
        const magicLinkForm = document.getElementById('magicLinkForm');
        if (magicLinkForm) {
            magicLinkForm.addEventListener('submit', (e) => this.handleMagicLink(e));
        }
    },

    /**
     * Check if user already has a valid session
     */
    async checkExistingSession() {
        try {
            const { data: { session }, error } = await supabaseAuth.auth.getSession();

            if (session && !error) {
                // User is already logged in, check if allowed
                if (this.isUserAllowed(session.user.email)) {
                    window.location.href = 'index.html';
                } else {
                    this.showError('Access denied. Your email is not authorized.');
                    await supabaseAuth.auth.signOut();
                }
            }
        } catch (err) {
            console.error('Session check error:', err);
        }
    },

    /**
     * Check authentication status (for dashboard pages)
     */
    async checkAuth() {
        try {
            const { data: { session }, error } = await supabaseAuth.auth.getSession();

            if (error || !session) {
                this.redirectToLogin();
                return false;
            }

            // Check if user is in whitelist
            if (!this.isUserAllowed(session.user.email)) {
                this.redirectToLogin('Access denied. Your email is not authorized.');
                await supabaseAuth.auth.signOut();
                return false;
            }

            // User is authenticated and allowed
            this.showUserInfo(session.user);
            return true;
        } catch (err) {
            console.error('Auth check error:', err);
            this.redirectToLogin();
            return false;
        }
    },

    /**
     * Check if email is in allowed users list
     */
    isUserAllowed(email) {
        if (!email) return false;
        return ALLOWED_USERS.some(allowed =>
            allowed.toLowerCase() === email.toLowerCase()
        );
    },

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const { data, error } = await supabaseAuth.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard/index.html'
                }
            });

            if (error) throw error;
        } catch (err) {
            console.error('Google sign-in error:', err);
            this.showError('Failed to sign in with Google. Please try again.');
        }
    },

    /**
     * Handle magic link form submission
     */
    async handleMagicLink(event) {
        event.preventDefault();

        const emailInput = document.getElementById('email');
        const submitBtn = document.getElementById('submitBtn');
        const email = emailInput.value.trim();

        if (!email) {
            this.showError('Please enter your email address.');
            return;
        }

        // Check if email is allowed before sending link
        if (!this.isUserAllowed(email)) {
            this.showError('This email is not authorized to access the dashboard.');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span>Sending...';

        try {
            const { data, error } = await supabaseAuth.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard/index.html'
                }
            });

            if (error) throw error;

            this.showSuccess('Magic link sent! Check your email inbox.');
            emailInput.value = '';
        } catch (err) {
            console.error('Magic link error:', err);
            this.showError('Failed to send magic link. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Magic Link';
        }
    },

    /**
     * Handle successful sign-in
     */
    async handleSignIn(session) {
        if (!session || !session.user) return;

        const email = session.user.email;

        if (this.isUserAllowed(email)) {
            // Redirect to dashboard if on login page
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
        } else {
            this.showError('Access denied. Your email is not authorized.');
            await supabaseAuth.auth.signOut();
        }
    },

    /**
     * Show user info in dashboard header
     */
    showUserInfo(user) {
        // Create user info element if it doesn't exist
        let userInfo = document.querySelector('.dashboard-user-info');

        if (!userInfo) {
            const headerControls = document.querySelector('.header-controls');
            if (headerControls) {
                userInfo = document.createElement('div');
                userInfo.className = 'dashboard-user-info';
                userInfo.innerHTML = `
                    <span class="user-email">${user.email}</span>
                    <button class="logout-btn" onclick="DashboardAuth.signOut()">Sign Out</button>
                `;
                headerControls.prepend(userInfo);
            }
        }
    },

    /**
     * Sign out user
     */
    async signOut() {
        try {
            await supabaseAuth.auth.signOut();
            this.redirectToLogin();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    },

    /**
     * Redirect to login page
     */
    redirectToLogin(message = null) {
        const loginUrl = 'login.html' + (message ? `?error=${encodeURIComponent(message)}` : '');
        window.location.href = loginUrl;
    },

    /**
     * Show error message
     */
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');

            // Hide after 5 seconds
            setTimeout(() => {
                errorEl.classList.remove('show');
            }, 5000);
        }
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        const successEl = document.getElementById('successMessage');
        if (successEl) {
            successEl.textContent = message;
            successEl.classList.add('show');
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    DashboardAuth.init();
});

// Check URL for error message (from redirect)
const urlParams = new URLSearchParams(window.location.search);
const errorParam = urlParams.get('error');
if (errorParam) {
    setTimeout(() => {
        DashboardAuth.showError(decodeURIComponent(errorParam));
    }, 100);
}

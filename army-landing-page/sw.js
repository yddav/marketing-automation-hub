/**
 * UNTRAPD Landing Page Service Worker
 * Offline support and performance caching
 */

const CACHE_NAME = 'untrapd-landing-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png'
];

// Resources to cache on first visit
const RUNTIME_CACHE = [
    '/site.webmanifest',
    '/og-image.jpg'
];

/**
 * Install event - cache static resources
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Service Worker: Activation failed', error);
            })
    );
});

/**
 * Fetch event - serve from cache with network fallback
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();

                        // Cache runtime resources
                        if (shouldCache(event.request.url)) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log('Service Worker: Caching runtime resource', event.request.url);
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL) || createOfflineResponse();
                        }
                        
                        // Return empty response for other failed requests
                        return new Response('', { status: 404, statusText: 'Not Found' });
                    });
            })
    );
});

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'CLEAR_CACHE':
                clearCache();
                break;
            case 'GET_CACHE_SIZE':
                getCacheSize().then(size => {
                    event.ports[0].postMessage({ size });
                });
                break;
        }
    }
});

/**
 * Background sync event - handle offline actions
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background sync operations
            handleBackgroundSync()
        );
    }
});

/**
 * Push event - handle push notifications (if needed)
 */
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/android-chrome-192x192.png',
                badge: '/favicon-32x32.png',
                tag: 'untrapd-notification',
                requireInteraction: false,
                actions: [
                    {
                        action: 'open',
                        title: 'Open UNTRAPD'
                    },
                    {
                        action: 'close',
                        title: 'Dismiss'
                    }
                ]
            })
        );
    }
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('https://hub.untrapd.com')
        );
    }
});

/**
 * Check if resource should be cached
 */
function shouldCache(url) {
    // Cache CSS, JS, and image files
    return /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp)$/i.test(url) ||
           RUNTIME_CACHE.some(resource => url.includes(resource));
}

/**
 * Create offline response
 */
function createOfflineResponse() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UNTRAPD - Offline</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #0f0f23;
                    color: white;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                }
                .offline-content {
                    max-width: 400px;
                    padding: 2rem;
                }
                .logo {
                    font-size: 2rem;
                    font-weight: bold;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }
                .message {
                    margin-bottom: 2rem;
                    opacity: 0.8;
                }
                .retry-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="offline-content">
                <div class="logo">UNTRAPD</div>
                <div class="message">
                    <h2>You're Offline</h2>
                    <p>Please check your internet connection and try again.</p>
                </div>
                <button class="retry-btn" onclick="window.location.reload()">
                    Retry
                </button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    });
}

/**
 * Clear all caches
 */
async function clearCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Service Worker: All caches cleared');
    } catch (error) {
        console.error('Service Worker: Error clearing caches', error);
    }
}

/**
 * Get total cache size
 */
async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
        
        return totalSize;
    } catch (error) {
        console.error('Service Worker: Error calculating cache size', error);
        return 0;
    }
}

/**
 * Handle background sync operations
 */
async function handleBackgroundSync() {
    try {
        // Implement background sync logic here
        // For example: send queued analytics events, sync offline actions, etc.
        console.log('Service Worker: Background sync completed');
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
        throw error; // Re-throw to trigger retry
    }
}

/**
 * Performance monitoring
 */
self.addEventListener('message', (event) => {
    if (event.data.type === 'PERFORMANCE_MARK') {
        // Handle performance marks from main thread
        console.log('Service Worker: Performance mark received', event.data);
    }
});

console.log('Service Worker: Script loaded');
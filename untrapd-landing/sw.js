/**
 * UNTRAPD Landing Page Service Worker
 * Offline support and performance optimization
 */

const CACHE_NAME = 'untrapd-landing-v1.0.0';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/favicon.svg',
    '/favicon.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Caching app shell');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('SW: Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('SW: Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((fetchResponse) => {
                        // Cache successful responses
                        if (fetchResponse.status === 200) {
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return fetchResponse;
                    });
            })
            .catch(() => {
                // Offline fallback for HTML requests
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});
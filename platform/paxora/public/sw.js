const CACHE_NAME = 'paxora-onboarding-v1';
const URLS_TO_CACHE = [
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=3000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=3000&auto=format&fit=crop'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

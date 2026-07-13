const CACHE = 'fablab-v1';
const STATIC = [
    './dashboard.html',
    './dashboard.css',
    './icon.svg',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Never intercept Supabase, Google Fonts data, or external APIs
    if (
        url.hostname.includes('supabase') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('script.google.com') ||
        e.request.method !== 'GET'
    ) {
        return;
    }

    // Cache-first for static assets, network-first for HTML
    if (e.request.destination === 'document') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match('./dashboard.html'))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            }))
        );
    }
});

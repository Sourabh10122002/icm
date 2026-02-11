// SVG Icon Definitions
// Shared between Popup and Offscreen
export const ICONS = {
    // Utility
    loader: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',

    // Themes
    standard: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    },
    flat: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#10B981" stroke="none"><circle cx="12" cy="12" r="10"></circle></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><circle cx="12" cy="12" r="10"></circle></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#EF4444" stroke="none"><circle cx="12" cy="12" r="10"></circle></svg>'
    },
    house: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
    },
    wifiLine: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>'
    },
    wifiSolid: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#10B981" stroke="none"><path d="M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M15.48 16.11a5 5 0 0 0-6.95 0l3.47 3.48 3.48-3.48z"/><path d="M18.84 12.55a10 10 0 0 0-13.68 0l2.36 2.36a6.6 6.6 0 0 1 8.96 0l2.36-2.36z"/><path d="M22.58 9a15 15 0 0 0-21.16 0l2.36 2.36a11.6 11.6 0 0 1 16.44 0l2.36-2.36z"/></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><path d="M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M15.48 16.11a5 5 0 0 0-6.95 0l3.47 3.48 3.48-3.48z"/><path d="M18.84 12.55a10 10 0 0 0-13.68 0l2.36 2.36a6.6 6.6 0 0 1 8.96 0l2.36-2.36z"/><path d="M22.58 9a15 15 0 0 0-21.16 0l2.36 2.36a11.6 11.6 0 0 1 16.44 0l2.36-2.36z"/></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#EF4444" stroke="none"><path d="m2 2 20 20" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/><path d="M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M8.53 16.11a5 5 0 0 1 6.95 0l-1.63 1.63-3.69-3.69 1.63 1.63z" opacity="1"/><path d="M18.84 12.55a10 10 0 0 0-13.68 0l2.36 2.36a6.6 6.6 0 0 1 8.96 0l2.36-2.36z" opacity="1"/><path d="M22.58 9a15 15 0 0 0-21.16 0l2.36 2.36a11.6 11.6 0 0 1 16.44 0l2.36-2.36z"/><path d="M2 2l20 20" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/></svg>'
    },
    traffic: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#1F2937"/><circle cx="12" cy="12" r="6" fill="#10B981"/></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#1F2937"/><circle cx="12" cy="12" r="6" fill="#F59E0B"/></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#1F2937"/><circle cx="12" cy="12" r="6" fill="#EF4444"/></svg>'
    },
    minimal: {
        online: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round"><line x1="2" y1="12" x2="22" y2="12"></line></svg>',
        warn: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 4"><line x1="2" y1="12" x2="22" y2="12"></line></svg>',
        offline: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="4" stroke-linecap="round"><circle cx="12" cy="12" r="1"/></svg>'
    }
};

import { defineConfig } from 'wxt';

export default defineConfig({
    manifest: {
        permissions: ['storage', 'alarms', 'notifications', 'offscreen'],
        host_permissions: ['<all_urls>'],
        name: "ICM - Internet Connection Monitor",
        description: "Monitor your internet connectivity in real-time. Tracks uptime, latency, and disconnects with visual charts, sound alerts, and detailed logs.",
        action: {
            default_title: "ICM Monitor",
            default_icon: {
                "16": "logo-16.png",
                "48": "logo-48.png",
                "128": "logo-128.png"
            }
        },
        icons: {
            "16": "logo-16.png",
            "48": "logo-48.png",
            "128": "logo-128.png"
        }
    },
    srcDir: '.',
    publicDir: 'public',
    // entrypointsDir: 'entrypoints', // Default

});

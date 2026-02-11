import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
    // --- Configuration ---
    let PING_URL = 'https://www.google.com/generate_204';
    let CHECK_INTERVAL = 2000;
    let PLAY_SOUNDS = true;
    let SOUND_PROFILE = 'beep';
    let ICON_THEME = 'standard';
    let VOLUME = 1.0;

    // --- State ---
    let currentState = 'OFFLINE'; // ONLINE | LAN_NO_INTERNET | OFFLINE
    let lastState = 'OFFLINE';
    let latency = 0;

    console.log("ICM: Service Worker Initializing...");

    // --- Initialization ---
    chrome.runtime.onInstalled.addListener(() => {
        console.log("ICM: Installed/Updated. Creating alarm.");
        loadSettings();
        chrome.alarms.create('connectivity-check', { periodInMinutes: CHECK_INTERVAL / 60000 });
        checkConnectivity(); // Immediate check
    });

    chrome.runtime.onStartup.addListener(() => {
        console.log("ICM: Browser Startup. Checking alarm.");
        loadSettings();
        chrome.alarms.create('connectivity-check', { periodInMinutes: CHECK_INTERVAL / 60000 });
        checkConnectivity(); // Immediate check
    });

    // --- Message Handling ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SETTINGS_UPDATED') {
            console.log("ICM: Settings updated.");
            loadSettings().then(() => {
                // Update icon immediately after settings change
                updateIcon(currentState);
            });
            // Re-create alarm with new interval
            chrome.alarms.create('connectivity-check', { periodInMinutes: CHECK_INTERVAL / 60000 });
            checkConnectivity(); // Immediate 
        } else if (message.type === 'RESET_STATS') {
            // Handle reset logic if tracked here
        }
    });

    // --- Alarm Handler ---
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'connectivity-check') {
            checkConnectivity();
        }
    });

    // --- Core Logic ---
    async function loadSettings() {
        return new Promise<void>((resolve) => {
            chrome.storage.local.get(['settings'], (result) => {
                const s = result.settings;
                if (s) {
                    if (s.pingUrl) PING_URL = s.pingUrl;
                    if (s.checkInterval) CHECK_INTERVAL = s.checkInterval;
                    if (s.playSounds !== undefined) PLAY_SOUNDS = s.playSounds;
                    if (s.soundProfile) SOUND_PROFILE = s.soundProfile;
                    if (s.volume !== undefined) VOLUME = s.volume;
                    if (s.iconTheme) ICON_THEME = s.iconTheme;
                }
                resolve();
            });
        });
    }

    async function checkConnectivity() {
        const online = navigator.onLine;

        // 1. Initial State: Offline if navigator says so
        if (!online) {
            updateState('OFFLINE', 0);
            return;
        }

        // 2. Precise Check: Fetch
        const start = Date.now();
        try {
            // Note: HEAD requests are faster; 'no-cache' ensures real network activity
            await fetch(PING_URL, { method: 'HEAD', cache: 'no-cache', mode: 'no-cors' });
            // Note: mode: 'no-cors' allows opaque response which is enough for "connectivity",
            // but for latency, we measure time.
            const end = Date.now();
            latency = end - start;

            updateState('ONLINE', latency);
            fetchPublicIP();

        } catch (error) {
            console.warn("ICM: Ping failed despite navigator.onLine:", error);
            // If fetch fails but navigator is true -> LAN but no Internet
            updateState('LAN_NO_INTERNET', 0);
        }
    }

    async function updateState(newState: string, newLatency: number) {
        // If state changed OR just ensuring icon/stats update
        const changed = currentState !== newState;
        lastState = currentState;
        currentState = newState;

        // Save Current Status
        const statusObj = {
            status: currentState,
            latency: newLatency,
            lastChecked: Date.now()
        };
        chrome.storage.local.set({ currentStatus: statusObj });

        // Update Icon always (to ensure theme match)
        updateIcon(currentState);

        // Update Cumulative Stats
        updateStats(newState, lastState);

        // Log if changed
        if (changed) {
            logEvent(lastState, currentState);

            // Play Sound?
            if (PLAY_SOUNDS) {
                if (currentState === 'ONLINE') {
                    playSound('ONLINE');
                } else if (currentState === 'OFFLINE') {
                    playSound('OFFLINE');
                } else if (currentState === 'LAN_NO_INTERNET') {
                    playSound('LAN_NO_INTERNET');
                }
            }
        }
    }

    async function updateStats(newState: string, oldState: string) {
        const now = Date.now();
        const result = await chrome.storage.local.get(['stats']);
        let stats = result.stats || {
            totalUptime: 0,
            totalDowntime: 0,
            disconnects: 0,
            lastOnlineStart: newState === 'ONLINE' ? now : null,
            lastOfflineStart: newState !== 'ONLINE' ? now : null,
            lastUpdated: now
        };

        const timeDiff = now - (stats.lastUpdated || now);

        // Update durations based on PREVIOUS state
        if (oldState === 'ONLINE') {
            stats.totalUptime += timeDiff;
        } else {
            stats.totalDowntime += timeDiff;
        }

        // Handle State Transitions
        if (newState === 'ONLINE' && oldState !== 'ONLINE') {
            stats.lastOnlineStart = now;
        } else if (newState !== 'ONLINE' && oldState === 'ONLINE') {
            stats.disconnects++;
            stats.lastOfflineStart = now;
        }

        stats.lastUpdated = now;
        chrome.storage.local.set({ stats });
    }

    // --- Sound / Offscreen ---

    let creatingOffscreen: Promise<void> | null = null;
    let offscreenReadyResolve: ((value: unknown) => void) | null = null;

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'OFFSCREEN_READY') {
            if (offscreenReadyResolve) {
                offscreenReadyResolve(true);
                offscreenReadyResolve = null;
            }
        }
    });

    async function ensureOffscreenDocument() {
        const hasDoc = await chrome.offscreen.hasDocument();
        if (hasDoc) return;

        if (creatingOffscreen) {
            await creatingOffscreen;
            return;
        }

        creatingOffscreen = (async () => {
            try {
                // Determine reasons needed (superset)
                const reasons = ['AUDIO_PLAYBACK', 'DOM_PARSER'] as any[];

                // Wait for ready signal
                const readyPromise = new Promise(resolve => { offscreenReadyResolve = resolve; });

                await chrome.offscreen.createDocument({
                    url: 'offscreen.html',
                    reasons: reasons,
                    justification: 'Rendering extension icon and playing notification sounds'
                });

                // Timeout for ready signal (1s) to avoid indefinite hang
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));
                await Promise.race([readyPromise, timeoutPromise]);

            } catch (e) {
                if (!((e as Error).message?.includes('Only a single offscreen'))) {
                    console.error("ICM: Failed to create offscreen doc", e);
                }
            } finally {
                creatingOffscreen = null;
            }
        })();

        await creatingOffscreen;
    }

    async function playSound(type: string) {
        try {
            await ensureOffscreenDocument();

            // Now attempt to send with retry
            let attempts = 0;
            while (attempts < 3) {
                try {
                    await chrome.runtime.sendMessage({ type: 'PLAY_SOUND', sound: type, profile: SOUND_PROFILE, volume: VOLUME });
                    return;
                } catch (sendError) {
                    attempts++;
                    if (attempts >= 3) {
                        try { await chrome.offscreen.closeDocument(); } catch (e) { }
                        throw sendError;
                    }
                    await new Promise(r => setTimeout(r, 200));
                }
            }
        } catch (e) {
            console.error("ICM: Sound playback failed", e);
        }
    }

    async function updateIcon(status: string) {
        // Render icon via offscreen
        try {
            await ensureOffscreenDocument();

            chrome.runtime.sendMessage({
                type: 'RENDER_ICON',
                theme: ICON_THEME,
                status: status
            }, (response) => {
                if (chrome.runtime.lastError) {
                    // ignore messaging errors if popup/offscreen closed unexpected
                    return;
                }
                if (response && response.imageData) {
                    try {
                        // Reconstruct ImageData if needed (it comes as a plain object)
                        const raw = response.imageData;
                        // Check if it's already a valid ImageData instance (unlikely over generic message passing)
                        let imgData = raw;

                        if (!(raw instanceof ImageData)) {
                            // Reconstruct: raw should be { width, height, data: prop }
                            // Note: raw.data might be an object {0:..., 1:...} if serialized badly, or an array.
                            // However, with message passing, Uint8ClampedArray usually survives or becomes object.
                            // We need it as Uint8ClampedArray.

                            const dataArray = raw.data instanceof Uint8ClampedArray
                                ? raw.data
                                : new Uint8ClampedArray(Object.values(raw.data));

                            imgData = new ImageData(dataArray, raw.width, raw.height);
                        }

                        chrome.action.setIcon({ imageData: imgData });
                        chrome.action.setBadgeText({ text: '' });
                    } catch (err) {
                        console.error("ICM: Icon processing error", err);
                        fallbackBadge(status);
                    }
                }
            });

        } catch (e) {
            console.error("ICM: Failed to render icon", e);
            fallbackBadge(status);
        }
    }

    function fallbackBadge(status: string) {
        let color = '#757575'; // Grey
        let text = '?';

        if (status === 'ONLINE') {
            color = '#10B981'; // Green
            text = 'ON';
        } else if (status === 'LAN_NO_INTERNET') {
            color = '#F59E0B'; // Orange
            text = '!';
        } else if (status === 'OFFLINE') {
            color = '#EF4444'; // Red
            text = 'OFF';
        }

        chrome.action.setBadgeBackgroundColor({ color: color });
        chrome.action.setBadgeText({ text: text });
    }

    function logEvent(from: string, to: string) {
        const event = {
            timestamp: Date.now(),
            type: 'STATUS_CHANGE',
            from: from,
            to: to
        };

        chrome.storage.local.get(['logs'], (result) => {
            const logs = result.logs || [];
            logs.unshift(event); // Add to top
            // Limit log size
            if (logs.length > 100) logs.pop();
            chrome.storage.local.set({ logs: logs });
        });
    }

    async function fetchPublicIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            chrome.storage.local.set({ cachedIP: data.ip });
        } catch (e) {
            // ignore
        }
    }
});

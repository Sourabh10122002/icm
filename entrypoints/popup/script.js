import { ICONS } from '../../utils/icons';

const PING_PRESETS = {
    'google': 'https://www.google.com/generate_204',
    'cloudflare': 'https://1.1.1.1',
    'baidu': 'https://www.baidu.com'
};

document.addEventListener('DOMContentLoaded', () => {
    try {
        initUI();
        startUpdates();
    } catch (e) {
        console.error("Popup Init Error", e);
    }
});

window.onerror = function (message, source, lineno, colno, error) {
    console.error("Popup Error:", message, error);
};

function initUI() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    chrome.storage.local.get(['settings'], (result) => {
        const theme = result.settings?.theme || 'dark';
        document.body.setAttribute('data-theme', theme);
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            switchView(targetId);
        });
    });

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            switchView('view-settings');
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchView('view-dashboard');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            const dashboardNav = document.querySelector('.nav-item[data-target="view-dashboard"]');
            if (dashboardNav) dashboardNav.classList.add('active');
        });
    }

    initSettingsLogic();

    const clearLogsBtn = document.getElementById('clear-logs');
    if (clearLogsBtn) clearLogsBtn.addEventListener('click', clearLogs);

    const btnClearLogs = document.getElementById('btn-clear-logs');
    if (btnClearLogs) btnClearLogs.addEventListener('click', clearLogs);

    const btnResetStats = document.getElementById('btn-reset-stats');
    if (btnResetStats) {
        btnResetStats.addEventListener('click', () => {
            window.chartData = new Array(MAX_DATA_POINTS).fill(0);
            drawChart();
            // Send reset to background
            chrome.runtime.sendMessage({ type: 'RESET_STATS' });

            const btn = document.getElementById('btn-reset-stats');
            const orig = btn.textContent;
            btn.textContent = "Reset!";
            setTimeout(() => btn.textContent = orig, 1000);
        });
    }

    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    // Speed Test
    const speedBtn = document.getElementById('btn-speed-test');
    if (speedBtn) {
        speedBtn.addEventListener('click', async () => {
            const val = document.getElementById('speed-value');
            const originalIcon = speedBtn.innerHTML;

            // Set Loading State
            val.textContent = '...';
            speedBtn.innerHTML = ICONS.loader;

            speedBtn.disabled = true;

            try {
                // Using a reliable 2MB test file from Cloudflare
                const testUrl = 'https://speed.cloudflare.com/__down?bytes=2000000';

                const startTime = Date.now();
                // Add timestamp to prevent caching
                const response = await fetch(testUrl + '&t=' + Date.now());

                if (!response.ok) throw new Error("Network error");

                const blob = await response.blob();
                const endTime = Date.now();

                const durationInSeconds = (endTime - startTime) / 1000;
                const sizeInBits = blob.size * 8;
                const speedBps = sizeInBits / durationInSeconds;
                const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

                val.textContent = speedMbps;
            } catch (e) {
                console.error("Speed test failed", e);
                val.textContent = 'Err';
            } finally {
                // Restore Button
                speedBtn.innerHTML = originalIcon;
                speedBtn.disabled = false;
            }
        });
    }

    initChart();
}

function switchView(viewId) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active-view'));
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden-view'));

    const target = document.getElementById(viewId);
    if (target) {
        target.classList.remove('hidden-view');
        target.classList.add('active-view');
    }

    const headerMain = document.getElementById('header-main');
    const headerSettings = document.getElementById('header-settings');
    const bottomNav = document.querySelector('.bottom-nav');

    if (viewId === 'view-settings') {
        if (headerMain) headerMain.classList.add('hidden-view');
        if (headerSettings) headerSettings.classList.remove('hidden-view');
        if (bottomNav) bottomNav.classList.add('hidden-nav');
        loadSettingsForm();
    } else {
        if (headerMain) headerMain.classList.remove('hidden-view');
        if (headerSettings) headerSettings.classList.add('hidden-view');
        if (bottomNav) bottomNav.classList.remove('hidden-nav');
    }
}

function initSettingsLogic() {
    const presetSelect = document.getElementById('ping-preset');
    const customUrlGroup = document.getElementById('custom-url-group');

    if (presetSelect) {
        presetSelect.addEventListener('change', () => {
            if (presetSelect.value === 'custom') {
                customUrlGroup.classList.remove('hidden');
            } else {
                customUrlGroup.classList.add('hidden');
            }
        });
    }

    const volumeSlider = document.getElementById('volume-slider');
    const volumeVal = document.getElementById('volume-val');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            const val = Math.round(volumeSlider.value * 100);
            if (volumeVal) volumeVal.textContent = `${val}%`;
        });
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings();
        });
    }
}

function loadSettingsForm() {
    chrome.storage.local.get(['settings'], (result) => {
        const s = result.settings || {};

        const currentUrl = s.pingUrl || PING_PRESETS['google'];
        const pingPreset = document.getElementById('ping-preset');
        let foundPreset = 'custom';

        for (const [key, url] of Object.entries(PING_PRESETS)) {
            if (url === currentUrl) {
                foundPreset = key;
                break;
            }
        }

        if (pingPreset) pingPreset.value = foundPreset;

        const customUrlGroup = document.getElementById('custom-url-group');
        const pingUrlInput = document.getElementById('ping-url');

        if (foundPreset === 'custom') {
            if (customUrlGroup) customUrlGroup.classList.remove('hidden');
            if (pingUrlInput) pingUrlInput.value = currentUrl;
        } else {
            if (customUrlGroup) customUrlGroup.classList.add('hidden');
        }

        const checkInterval = document.getElementById('check-interval');
        if (checkInterval) checkInterval.value = s.checkInterval || 2000;

        const playSounds = document.getElementById('play-sounds');
        if (playSounds) playSounds.checked = s.playSounds !== false;

        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) volumeSlider.value = s.volume !== undefined ? s.volume : 1;

        const volumeVal = document.getElementById('volume-val');
        if (volumeVal) volumeVal.textContent = `${Math.round((s.volume !== undefined ? s.volume : 1) * 100)}%`;

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.value = s.theme || 'dark';

        const precisionSelect = document.getElementById('precision-select');
        if (precisionSelect) precisionSelect.value = s.precision || 'regular';

        const iconTheme = s.iconTheme || 'standard';
        renderThemeGrid(iconTheme);

        const soundProfile = document.getElementById('sound-profile');
        if (soundProfile) soundProfile.value = s.soundProfile || 'beep';
    });
}

function renderThemeGrid(currentTheme) {
    const grid = document.getElementById('icon-theme-grid');
    if (!grid) return;

    // Ordered list of themes to display
    const themes = ['standard', 'flat', 'house', 'wifiLine', 'wifiSolid', 'traffic', 'minimal'];

    grid.innerHTML = '';

    themes.forEach(theme => {
        const set = ICONS[theme];
        if (!set) return;

        const label = document.createElement('label');
        label.className = 'theme-option';

        // Radio Input
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'icon-theme';
        input.value = theme;
        if (theme === currentTheme) input.checked = true;

        // Preview Container
        const preview = document.createElement('div');
        preview.className = 'theme-preview';

        // Show Online, Warn, Offline previews small
        preview.innerHTML = `
            <div class="mini-icon online">${set.online}</div>
            <div class="mini-icon warn">${set.warn}</div>
            <div class="mini-icon offline">${set.offline}</div>
        `;

        label.appendChild(input);
        label.appendChild(preview);
        grid.appendChild(label);
    });
}

function saveSettings() {
    const preset = document.getElementById('ping-preset').value;
    let url = '';
    if (preset === 'custom') {
        url = document.getElementById('ping-url').value;
    } else {
        url = PING_PRESETS[preset];
    }

    // Get selected radio
    const selectedTheme = document.querySelector('input[name="icon-theme"]:checked')?.value || 'standard';

    const newSettings = {
        pingUrl: url,
        checkInterval: parseInt(document.getElementById('check-interval').value),
        playSounds: document.getElementById('play-sounds').checked,
        volume: parseFloat(document.getElementById('volume-slider').value),
        theme: document.getElementById('theme-select').value,
        precision: document.getElementById('precision-select').value,
        iconTheme: selectedTheme,
        soundProfile: document.getElementById('sound-profile').value
    };

    chrome.storage.local.set({ settings: newSettings }, () => {
        document.body.setAttribute('data-theme', newSettings.theme);

        const btn = document.querySelector('#settings-form .btn-primary');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Settings Saved!';
            setTimeout(() => btn.textContent = orig, 1500);
        }

        chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' });
    });
}

function clearLogs() {
    chrome.storage.local.set({ logs: [] }, updateLogs);
}

function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);

    // Toggle Icon
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const iconName = next === 'dark' ? 'moon' : 'sun';
        themeBtn.innerHTML = ICONS[iconName];
    }

    chrome.storage.local.get(['settings'], (r) => {
        const s = r.settings || {};
        s.theme = next;
        chrome.storage.local.set({ settings: s });
    });
}

function startUpdates() {
    updateUI();
    updateLogs();
    setInterval(updateUI, 1000);
}

function updateUI() {
    chrome.storage.local.get(['currentStatus', 'settings', 'cachedIP', 'stats'], (result) => {
        const state = result.currentStatus;
        const settings = result.settings || {};

        if (!state) {
            const statusText = document.getElementById('status-text');
            if (statusText) statusText.textContent = "Initializing...";
            return;
        }

        const statusText = document.getElementById('status-text');
        const statusSubtext = document.getElementById('status-subtext');
        const iconDisplay = document.getElementById('status-icon-display');
        const root = document.querySelector(':root');

        if (!statusText || !iconDisplay) return;

        let color = '#757575';
        let text = 'Unknown';
        let sub = '';

        if (state.status === 'ONLINE') {
            text = "Online";
            sub = "Connected securely";
            color = '#10B981';
        } else if (state.status === 'LAN_NO_INTERNET') {
            text = "Connection Issue";
            sub = "LAN Connected, No Internet";
            color = '#F59E0B';
        } else {
            text = "Offline";
            sub = "No network detected";
            color = '#EF4444';
        }

        statusText.textContent = text;
        statusSubtext.textContent = sub;
        root.style.setProperty('--status-color', color);

        const theme = settings.iconTheme || 'standard';
        iconDisplay.innerHTML = getStatusIcon(state.status, theme);

        const latency = state.latency ? state.latency : 0;
        const precision = settings.precision === 'expert' ? 2 : 0;

        let displayLatency = '--';
        if (latency > 0) {
            displayLatency = precision === 0 ? Math.round(latency) : latency.toFixed(2);
        }
        document.getElementById('ping-value').textContent = displayLatency;
        document.getElementById('ip-value').textContent = result.cachedIP || 'Fetching...';

        // Advanced Metrics
        const stats = result.stats || { totalUptime: 0, totalDowntime: 0, disconnects: 0, lastOnlineStart: Date.now() };

        // Online For
        if (state.status === 'ONLINE') {
            const currentSession = Date.now() - (stats.lastOnlineStart || Date.now());
            document.getElementById('online-for-value').textContent = formatDuration(currentSession);
        } else {
            document.getElementById('online-for-value').textContent = "Offline";
        }

        // Disconnects
        document.getElementById('disconnects-value').textContent = stats.disconnects;

        // Availability
        const totalTime = stats.totalUptime + stats.totalDowntime;
        let availability = 100;
        if (totalTime > 0) {
            availability = (stats.totalUptime / totalTime) * 100;
        }
        document.getElementById('availability-value').textContent = availability.toFixed(2);

        // Downtime
        document.getElementById('downtime-value').textContent = formatDuration(stats.totalDowntime);

        if (window.latencyChart && latency > 0) {
            updateChart(latency);
        }
    });
}

function formatDuration(ms) {
    if (ms < 1000) return "0s";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let str = "";
    if (days > 0) str += `${days}d `;
    if (hours > 0) str += `${hours}h `;
    if (minutes > 0) str += `${minutes}m `;
    if (seconds > 0 && days === 0 && hours === 0) str += `${seconds}s`;

    return str.trim() || "<1m";
}

function getStatusIcon(status, theme = 'standard') {
    // Fallback to standard if theme missing
    const iconSet = ICONS[theme] || ICONS['standard'];

    if (status === 'ONLINE') {
        return iconSet.online;
    } else if (status === 'LAN_NO_INTERNET') {
        return iconSet.warn;
    } else if (status === 'OFFLINE') {
        return iconSet.offline;
    }

    return iconSet.offline;
}

function updateLogs() {
    chrome.storage.local.get(['logs'], (result) => {
        const logs = result.logs || [];
        const container = document.getElementById('logs-list');
        if (container) {
            container.innerHTML = '';

            if (logs.length === 0) {
                container.innerHTML = '<div class="empty-log">No events recorded</div>';
                return;
            }

            logs.slice(0, 50).forEach(log => {
                const div = document.createElement('div');
                div.className = 'log-item';
                const date = new Date(log.timestamp).toLocaleTimeString();
                div.innerHTML = `
                <span class="log-time">${date}</span>
                <span class="log-msg">${formatLogMessage(log)}</span>
            `;
                container.appendChild(div);
            });
        }
    });
}

function formatLogMessage(log) {
    if (log.type === 'STATUS_CHANGE') {
        const map = { 'ONLINE': 'Online', 'OFFLINE': 'Offline', 'LAN_NO_INTERNET': 'Connection Issue' };
        return `${map[log.from] || log.from} ➔ ${map[log.to] || log.to}`;
    }
    return log.type;
}

function exportCSV() {
    chrome.storage.local.get(['logs'], (result) => {
        const logs = result.logs || [];
        if (!logs.length) return;

        let csv = 'Timestamp,Type,From,To\n';
        logs.forEach(l => {
            csv += `${new Date(l.timestamp).toISOString()},${l.type},${l.from || ''},${l.to || ''}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'icm_logs.csv';
        a.click();
    });
}

const MAX_DATA_POINTS = 30;
window.chartData = new Array(MAX_DATA_POINTS).fill(0);

function initChart() {
    const canvas = document.getElementById('latency-chart');
    if (!canvas) return;
    window.latencyChart = {
        ctx: canvas.getContext('2d'),
        canvas: canvas,
        width: canvas.width,
        height: canvas.height
    };
    drawChart();
}

function updateChart(latency) {
    window.chartData.push(latency);
    if (window.chartData.length > MAX_DATA_POINTS) window.chartData.shift();
    drawChart();
}

function drawChart() {
    const { ctx, width, height } = window.latencyChart;
    const data = window.chartData;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); // Primary Green
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const maxVal = Math.max(...data, 100) * 1.2;
    const step = width / (data.length - 1);

    const getX = (i) => i * step;
    const getY = (val) => height - (val / maxVal * height);

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(getX(0), getY(data[0]));

    for (let i = 0; i < data.length - 1; i++) {
        const xc = (getX(i) + getX(i + 1)) / 2;
        const yc = (getY(data[i]) + getY(data[i + 1])) / 2;
        ctx.quadraticCurveTo(getX(i), getY(data[i]), xc, yc);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    for (let i = 0; i < data.length - 1; i++) {
        const xc = (getX(i) + getX(i + 1)) / 2;
        const yc = (getY(data[i]) + getY(data[i + 1])) / 2;
        ctx.quadraticCurveTo(getX(i), getY(data[i]), xc, yc);
    }

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

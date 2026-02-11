// Notify background that we are ready
chrome.runtime.sendMessage({ type: 'OFFSCREEN_READY' });

import { ICONS } from '../../utils/icons';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Offscreen: Received message", msg);
    if (msg.type === 'PLAY_SOUND') {
        const profile = msg.profile || 'beep';
        const volume = msg.volume !== undefined ? msg.volume : 1.0;
        playTone(msg.sound, profile, volume);
        sendResponse(true);
    } else if (msg.type === 'RENDER_ICON') {
        renderIconToDataURL(msg.theme, msg.status).then(imageData => {
            sendResponse({ imageData });
        });
        return true; // Keep channel open
    }
});

async function renderIconToDataURL(theme, status) {
    const iconSet = ICONS[theme] || ICONS['standard'];
    let svg = iconSet.offline;
    if (status === 'ONLINE') svg = iconSet.online;
    if (status === 'LAN_NO_INTERNET') svg = iconSet.warn;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 128, 128);
            URL.revokeObjectURL(url);
            // We need ImageData for setIcon, but setIcon takes ImageData OR path.
            // Actually, chrome.action.setIcon takes ImageData.
            const imageData = ctx.getImageData(0, 0, 128, 128);

            // Explicitly serialize because ImageData properties might be lost in messaging
            resolve({
                width: 128,
                height: 128,
                data: Array.from(imageData.data) // Convert Uint8ClampedArray to normal array for safety
            });
        };
        img.src = url;
    });
}

// --- Speech Synthesis Setup ---
function loadVoices() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                const updatedVoices = window.speechSynthesis.getVoices();
                resolve(updatedVoices);
            };
            // Fallback timeout
            setTimeout(() => resolve([]), 2000);
        }
    });
}
// Pre-load voices
loadVoices();

async function playTone(type, profile, volume) {
    try {
        // --- 1. Voice Profile (TTS) ---
        if (profile === 'voice') {
            await speakStatus(type, volume);
            return;
        }

        // --- 2. Web Audio Profiles ---
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        if (ctx.state === 'suspended') await ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Master Volume Gain
        const masterGain = ctx.createGain();
        masterGain.gain.value = volume;

        osc.connect(gain);
        gain.connect(masterGain);
        masterGain.connect(ctx.destination);

        if (profile === 'futuristic') {
            playFuturistic(type, osc, gain, now);
        } else if (profile === '8bit') {
            play8Bit(type, osc, gain, now);
        } else if (profile === 'soft') {
            playSoft(type, osc, gain, now);
        } else {
            // Default Beep
            playBeep(type, osc, gain, now);
        }

    } catch (e) {
        console.error("Offscreen: Playback Error", e);
    }
}

async function speakStatus(type, volume) {
    // Ensure voices are loaded
    const voices = await loadVoices();

    const utterance = new SpeechSynthesisUtterance();
    utterance.volume = volume;

    // Pick a good voice if available (e.g., Google US English or Microsoft David/Zira)
    const preferred = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
    if (preferred) utterance.voice = preferred;

    if (type === 'ONLINE') {
        utterance.text = "Internet Connection Restored";
        utterance.rate = 1.1;
        utterance.pitch = 1.1;
    } else if (type === 'OFFLINE') {
        utterance.text = "Internet Connection Lost";
        utterance.rate = 1.2;
        utterance.pitch = 0.9;
    } else if (type === 'LAN_NO_INTERNET') {
        utterance.text = "Warning: No Internet Access";
        utterance.rate = 1.1;
    }

    window.speechSynthesis.speak(utterance);
}

function playBeep(type, osc, gain, now) {
    if (type === 'ONLINE') {
        // Success Chime (Major Third)
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'OFFLINE') {
        // Error Buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'LAN_NO_INTERNET') {
        // Warning Beep
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0, now + 0.1);
        gain.gain.setValueAtTime(0.2, now + 0.2);
        gain.gain.setValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}

function playFuturistic(type, osc, gain, now) {
    if (type === 'ONLINE') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    } else if (type === 'OFFLINE') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'LAN_NO_INTERNET') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

function play8Bit(type, osc, gain, now) {
    if (type === 'ONLINE') {
        // 1-Up Sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(1320, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.setValueAtTime(0.1, now + 0.2);
        gain.gain.setValueAtTime(0, now + 0.21);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'OFFLINE') {
        // Game Over descent
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'LAN_NO_INTERNET') {
        // Wrong selection
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

function playSoft(type, osc, gain, now) {
    if (type === 'ONLINE') {
        // Gentle Sine swell
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        osc.start(now);
        osc.stop(now + 1.0);
    } else if (type === 'OFFLINE') {
        // Low Sine fade
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.exponentialRampToValueAtTime(196, now + 0.4); // G3

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
    } else if (type === 'LAN_NO_INTERNET') {
        // Subtle warning
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    }
}

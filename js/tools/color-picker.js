// DOM Elements
const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const colorPreview = document.getElementById('colorPreview');
const colorName = document.getElementById('colorName');
const rgbInput = document.getElementById('rgbInput');
const hslInput = document.getElementById('hslInput');
const cmykInput = document.getElementById('cmykInput');
const namedColorInput = document.getElementById('namedColorInput');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const harmonyColors = document.getElementById('harmonyColors');
const recentColors = document.getElementById('recentColors');
const savedColors = document.getElementById('savedColors');

// Color conversion functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToCmyk(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

// Color name mapping
const colorNames = {
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    // Add more color names as needed
};

// Update color preview and formats
function updateColor(hex) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    // Update color preview
    colorPreview.style.backgroundColor = hex;
    colorPreview.style.color = getContrastColor(hex);

    // Update color name
    colorName.textContent = colorNames[hex.toUpperCase()] || 'Custom Color';

    // Update format inputs
    hexInput.value = hex;
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    cmykInput.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    namedColorInput.value = colorNames[hex.toUpperCase()] || 'Custom Color';

    // Add to recent colors
    addToRecentColors(hex);
}

// Get contrast color (black or white)
function getContrastColor(hex) {
    const rgb = hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// Color manipulation
function adjustBrightness(hex, amount) {
    const rgb = hexToRgb(hex);
    const factor = 1 + (amount / 100);
    return rgbToHex(
        Math.min(255, Math.round(rgb.r * factor)),
        Math.min(255, Math.round(rgb.g * factor)),
        Math.min(255, Math.round(rgb.b * factor))
    );
}

function adjustSaturation(hex, amount) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const newSaturation = Math.max(0, Math.min(100, hsl.s + amount));
    const newRgb = hslToRgb(hsl.h, newSaturation, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Color harmonies
function generateHarmony(type) {
    const hex = hexInput.value;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let harmonyColors = [];

    switch (type) {
        case 'complementary':
            harmonyColors = [hex, rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)];
            break;
        case 'triadic':
            const h1 = (hsl.h + 120) % 360;
            const h2 = (hsl.h + 240) % 360;
            const rgb1 = hslToRgb(h1, hsl.s, hsl.l);
            const rgb2 = hslToRgb(h2, hsl.s, hsl.l);
            harmonyColors = [hex, rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)];
            break;
        case 'analogous':
            const h3 = (hsl.h + 30) % 360;
            const h4 = (hsl.h + 330) % 360;
            const rgb3 = hslToRgb(h3, hsl.s, hsl.l);
            const rgb4 = hslToRgb(h4, hsl.s, hsl.l);
            harmonyColors = [rgbToHex(rgb4.r, rgb4.g, rgb4.b), hex, rgbToHex(rgb3.r, rgb3.g, rgb3.b)];
            break;
    }

    displayHarmonyColors(harmonyColors);
}

function displayHarmonyColors(colors) {
    harmonyColors.innerHTML = colors.map(color => `
        <div class="color-swatch" style="background-color: ${color}; width: 50px; height: 50px; border-radius: 4px; cursor: pointer;" 
             onclick="hexInput.value = '${color}'; updateColor('${color}')">
        </div>
    `).join('');
}

// Recent and saved colors
function addToRecentColors(hex) {
    let recent = JSON.parse(localStorage.getItem('recentColors') || '[]');
    recent = [hex, ...recent.filter(c => c !== hex)].slice(0, 10);
    localStorage.setItem('recentColors', JSON.stringify(recent));
    displayRecentColors(recent);
}

function displayRecentColors(colors) {
    recentColors.innerHTML = colors.map(color => `
        <div class="color-swatch" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;" 
             onclick="hexInput.value = '${color}'; updateColor('${color}')">
        </div>
    `).join('');
}

function saveColor(hex) {
    let saved = JSON.parse(localStorage.getItem('savedColors') || '[]');
    if (!saved.includes(hex)) {
        saved.push(hex);
        localStorage.setItem('savedColors', JSON.stringify(saved));
        displaySavedColors(saved);
    }
}

function displaySavedColors(colors) {
    savedColors.innerHTML = colors.map(color => `
        <div class="color-swatch" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; position: relative;" 
             onclick="hexInput.value = '${color}'; updateColor('${color}')">
            <button class="btn btn-sm btn-danger position-absolute top-0 end-0" 
                    onclick="removeSavedColor('${color}'); event.stopPropagation();">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeSavedColor(hex) {
    let saved = JSON.parse(localStorage.getItem('savedColors') || '[]');
    saved = saved.filter(c => c !== hex);
    localStorage.setItem('savedColors', JSON.stringify(saved));
    displaySavedColors(saved);
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    const button = element.nextElementSibling;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

// Event listeners
colorPicker.addEventListener('input', (e) => {
    updateColor(e.target.value);
});

hexInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        updateColor(hex);
    }
});

brightnessSlider.addEventListener('input', (e) => {
    const amount = parseInt(e.target.value);
    brightnessValue.textContent = `${amount}%`;
    const hex = hexInput.value;
    const adjustedHex = adjustBrightness(hex, amount);
    updateColor(adjustedHex);
});

saturationSlider.addEventListener('input', (e) => {
    const amount = parseInt(e.target.value);
    saturationValue.textContent = `${amount}%`;
    const hex = hexInput.value;
    const adjustedHex = adjustSaturation(hex, amount);
    updateColor(adjustedHex);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load recent colors
    const recent = JSON.parse(localStorage.getItem('recentColors') || '[]');
    displayRecentColors(recent);

    // Load saved colors
    const saved = JSON.parse(localStorage.getItem('savedColors') || '[]');
    displaySavedColors(saved);

    // Initialize color
    updateColor('#000000');
}); 
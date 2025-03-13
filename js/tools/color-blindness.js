// DOM Elements
const foregroundColor = document.getElementById('foregroundColor');
const foregroundHex = document.getElementById('foregroundHex');
const backgroundColor = document.getElementById('backgroundColor');
const backgroundHex = document.getElementById('backgroundHex');
const visionType = document.getElementById('visionType');
const severity = document.getElementById('severity');
const originalPreview = document.getElementById('originalPreview');
const simulatedPreview = document.getElementById('simulatedPreview');
const sampleText = document.getElementById('sampleText');
const originalContrast = document.getElementById('originalContrast');
const simulatedContrast = document.getElementById('simulatedContrast');
const foregroundInfo = document.getElementById('foregroundInfo');
const backgroundInfo = document.getElementById('backgroundInfo');
const accessibilityResults = document.getElementById('accessibilityResults');

// Color conversion matrices for different types of color blindness
const colorMatrices = {
    normal: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ],
    protanopia: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758]
    ],
    deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
    ],
    tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525]
    ],
    protanomaly: [
        [0.817, 0.183, 0],
        [0.333, 0.667, 0],
        [0, 0, 1]
    ],
    deuteranomaly: [
        [0.8, 0.2, 0],
        [0.258, 0.742, 0],
        [0, 0.142, 0.858]
    ],
    tritanomaly: [
        [0.967, 0.033, 0],
        [0, 0.733, 0.267],
        [0, 0.183, 0.817]
    ],
    achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114]
    ]
};

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Convert RGB to HSL
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

// Convert HSL to RGB
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

// Convert RGB to CMYK
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

// Calculate relative luminance
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Apply color blindness simulation
function simulateColorBlindness(rgb, type, severityValue) {
    const matrix = colorMatrices[type];
    const severityPercent = severityValue / 100;
    
    // Interpolate between normal vision and color blindness matrices
    const interpolatedMatrix = matrix.map(row => 
        row.map((value, i) => {
            const normalValue = colorMatrices.normal[matrix.indexOf(row)][i];
            return normalValue + (value - normalValue) * severityPercent;
        })
    );

    // Apply matrix transformation
    const result = {
        r: Math.round(rgb.r * interpolatedMatrix[0][0] + rgb.g * interpolatedMatrix[0][1] + rgb.b * interpolatedMatrix[0][2]),
        g: Math.round(rgb.r * interpolatedMatrix[1][0] + rgb.g * interpolatedMatrix[1][1] + rgb.b * interpolatedMatrix[1][2]),
        b: Math.round(rgb.r * interpolatedMatrix[2][0] + rgb.g * interpolatedMatrix[2][1] + rgb.b * interpolatedMatrix[2][2])
    };

    // Clamp values to valid range
    result.r = Math.max(0, Math.min(255, result.r));
    result.g = Math.max(0, Math.min(255, result.g));
    result.b = Math.max(0, Math.min(255, result.b));

    return result;
}

// Update color information display
function updateColorInfo(rgb, element) {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    element.querySelector('#foregroundRGB, #backgroundRGB').textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    element.querySelector('#foregroundHSL, #backgroundHSL').textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
    element.querySelector('#foregroundCMYK, #backgroundCMYK').textContent = `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;
}

// Update preview and contrast information
function updatePreview() {
    const fgRgb = hexToRgb(foregroundHex.value);
    const bgRgb = hexToRgb(backgroundHex.value);
    const text = sampleText.value;

    // Update original preview
    originalPreview.style.backgroundColor = backgroundHex.value;
    originalPreview.querySelector('span').style.color = foregroundHex.value;
    originalPreview.querySelector('span').textContent = text;

    // Calculate original contrast
    const originalL1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const originalL2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const originalRatio = getContrastRatio(originalL1, originalL2);
    originalContrast.textContent = originalRatio.toFixed(1) + ':1';

    // Simulate color blindness
    const simulatedFgRgb = simulateColorBlindness(fgRgb, visionType.value, severity.value);
    const simulatedBgRgb = simulateColorBlindness(bgRgb, visionType.value, severity.value);

    // Update simulated preview
    simulatedPreview.style.backgroundColor = rgbToHex(simulatedBgRgb.r, simulatedBgRgb.g, simulatedBgRgb.b);
    simulatedPreview.querySelector('span').style.color = rgbToHex(simulatedFgRgb.r, simulatedFgRgb.g, simulatedFgRgb.b);
    simulatedPreview.querySelector('span').textContent = text;

    // Calculate simulated contrast
    const simulatedL1 = getLuminance(simulatedFgRgb.r, simulatedFgRgb.g, simulatedFgRgb.b);
    const simulatedL2 = getLuminance(simulatedBgRgb.r, simulatedBgRgb.g, simulatedBgRgb.b);
    const simulatedRatio = getContrastRatio(simulatedL1, simulatedL2);
    simulatedContrast.textContent = simulatedRatio.toFixed(1) + ':1';

    // Update color information
    updateColorInfo(fgRgb, foregroundInfo);
    updateColorInfo(bgRgb, backgroundInfo);

    // Update accessibility results
    updateAccessibilityResults(originalRatio, simulatedRatio);
}

// Update accessibility results
function updateAccessibilityResults(originalRatio, simulatedRatio) {
    const results = [];
    
    // Check normal text contrast
    if (originalRatio >= 4.5) {
        results.push('<div class="alert alert-success">✓ Normal text meets WCAG 2.1 contrast requirements</div>');
    } else {
        results.push('<div class="alert alert-danger">✗ Normal text does not meet WCAG 2.1 contrast requirements</div>');
    }

    // Check large text contrast
    if (originalRatio >= 3) {
        results.push('<div class="alert alert-success">✓ Large text meets WCAG 2.1 contrast requirements</div>');
    } else {
        results.push('<div class="alert alert-danger">✗ Large text does not meet WCAG 2.1 contrast requirements</div>');
    }

    // Check simulated contrast
    if (simulatedRatio >= 4.5) {
        results.push('<div class="alert alert-success">✓ Simulated view meets WCAG 2.1 contrast requirements</div>');
    } else {
        results.push('<div class="alert alert-warning">⚠ Simulated view may have contrast issues</div>');
    }

    accessibilityResults.innerHTML = results.join('');
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = element.nextElementSibling;
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = originalContent;
    }, 2000);
}

// Event listeners
foregroundColor.addEventListener('input', (e) => {
    foregroundHex.value = e.target.value;
    updatePreview();
});

foregroundHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        foregroundColor.value = hex;
        updatePreview();
    }
});

backgroundColor.addEventListener('input', (e) => {
    backgroundHex.value = e.target.value;
    updatePreview();
});

backgroundHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        backgroundColor.value = hex;
        updatePreview();
    }
});

visionType.addEventListener('change', updatePreview);
severity.addEventListener('input', updatePreview);
sampleText.addEventListener('input', updatePreview);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updatePreview();
}); 
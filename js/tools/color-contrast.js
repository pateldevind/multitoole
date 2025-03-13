// DOM Elements
const foregroundColor = document.getElementById('foregroundColor');
const foregroundHex = document.getElementById('foregroundHex');
const foregroundPreview = document.getElementById('foregroundPreview');
const foregroundName = document.getElementById('foregroundName');
const backgroundColor = document.getElementById('backgroundColor');
const backgroundHex = document.getElementById('backgroundHex');
const backgroundPreview = document.getElementById('backgroundPreview');
const backgroundName = document.getElementById('backgroundName');
const contrastRatio = document.getElementById('contrastRatio');
const wcagResults = document.getElementById('wcagResults');
const sampleText = document.getElementById('sampleText');
const previewText = document.getElementById('previewText');
const previewRatio = document.getElementById('previewRatio');
const contrastPreview = document.getElementById('contrastPreview');
const lighterVariations = document.getElementById('lighterVariations');
const darkerVariations = document.getElementById('darkerVariations');
const fontSize = document.getElementById('fontSize');
const preview = document.getElementById('preview');
const wcagLevel = document.getElementById('wcagLevel');
const colorInfo = document.getElementById('colorInfo');
const accessibilityStatus = document.getElementById('accessibilityStatus');
const savedCombinations = document.getElementById('savedCombinations');

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

    return { h: h * 360, s: s * 100, l: l * 100 };
}

// Calculate relative luminance
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return Math.round(ratio * 100) / 100;
}

// Check WCAG compliance
function checkWCAGCompliance(ratio, fontSize) {
    const isLargeText = fontSize >= 18;
    const results = {
        normal: {
            aa: ratio >= 4.5,
            aaa: ratio >= 7
        },
        large: {
            aa: ratio >= 3,
            aaa: ratio >= 4.5
        }
    };

    return {
        level: isLargeText ? 'large' : 'normal',
        aa: isLargeText ? results.large.aa : results.normal.aa,
        aaa: isLargeText ? results.large.aaa : results.normal.aaa
    };
}

// Generate color variations
function generateColorVariations(hex) {
    const rgb = hexToRgb(hex);
    const variations = {
        lighter: [],
        darker: []
    };

    // Generate lighter variations
    for (let i = 1; i <= 5; i++) {
        const factor = 1 + (i * 0.1);
        variations.lighter.push(rgbToHex(
            Math.min(255, Math.round(rgb.r * factor)),
            Math.min(255, Math.round(rgb.g * factor)),
            Math.min(255, Math.round(rgb.b * factor))
        ));
    }

    // Generate darker variations
    for (let i = 1; i <= 5; i++) {
        const factor = 1 - (i * 0.1);
        variations.darker.push(rgbToHex(
            Math.max(0, Math.round(rgb.r * factor)),
            Math.max(0, Math.round(rgb.g * factor)),
            Math.max(0, Math.round(rgb.b * factor))
        ));
    }

    return variations;
}

// Display color variations
function displayColorVariations(hex) {
    const variations = generateColorVariations(hex);
    
    lighterVariations.innerHTML = variations.lighter.map(color => `
        <div class="color-swatch" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;" 
             onclick="updateColor('${color}')">
        </div>
    `).join('');

    darkerVariations.innerHTML = variations.darker.map(color => `
        <div class="color-swatch" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;" 
             onclick="updateColor('${color}')">
        </div>
    `).join('');
}

// Update color previews and contrast
function updateColor(hex, isForeground = true) {
    const preview = isForeground ? foregroundPreview : backgroundPreview;
    const name = isForeground ? foregroundName : backgroundName;
    const input = isForeground ? foregroundHex : backgroundHex;
    const colorPicker = isForeground ? foregroundColor : backgroundColor;

    preview.style.backgroundColor = hex;
    preview.style.color = getContrastColor(hex);
    name.textContent = colorNames[hex.toUpperCase()] || 'Custom Color';
    input.value = hex;
    colorPicker.value = hex;

    updateContrast();
}

// Get contrast color (black or white)
function getContrastColor(hex) {
    const rgb = hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// Update contrast preview and results
function updateContrast() {
    const ratio = getContrastRatio(foregroundHex.value, backgroundHex.value);
    
    // Update contrast ratio display
    contrastRatio.value = `${ratio}:1`;
    previewRatio.textContent = `${ratio}:1`;

    // Update contrast preview
    contrastPreview.style.backgroundColor = backgroundHex.value;
    contrastPreview.style.color = foregroundHex.value;

    // Update WCAG compliance
    const compliance = checkWCAGCompliance(ratio, parseInt(fontSize.value));
    wcagLevel.innerHTML = `
        <div class="d-flex justify-content-between">
            <span>Level AA:</span>
            <span class="${compliance.aa ? 'text-success' : 'text-danger'}">
                ${compliance.aa ? 'Pass' : 'Fail'}
            </span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Level AAA:</span>
            <span class="${compliance.aaa ? 'text-success' : 'text-warning'}">
                ${compliance.aaa ? 'Pass' : 'Fail'}
            </span>
        </div>
    `;

    // Generate color variations
    displayColorVariations(foregroundHex.value);
}

// Update sample text
function updateSampleText() {
    previewText.textContent = sampleText.value;
}

// Update preview
function updatePreview() {
    const text = sampleText.value;
    const size = fontSize.value;
    preview.style.backgroundColor = backgroundColor.value;
    preview.style.color = foregroundColor.value;
    preview.style.fontSize = `${size}px`;
    preview.innerHTML = text;
}

// Update color information
function updateColorInfo() {
    const fgRgb = hexToRgb(foregroundColor.value);
    const bgRgb = hexToRgb(backgroundColor.value);
    const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

    colorInfo.innerHTML = `
        <strong>Foreground:</strong><br>
        RGB: ${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}<br>
        HSL: ${Math.round(fgHsl.h)}°, ${Math.round(fgHsl.s)}%, ${Math.round(fgHsl.l)}%<br><br>
        <strong>Background:</strong><br>
        RGB: ${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}<br>
        HSL: ${Math.round(bgHsl.h)}°, ${Math.round(bgHsl.s)}%, ${Math.round(bgHsl.l)}%
    `;
}

// Update accessibility status
function updateAccessibilityStatus(ratio, compliance) {
    const status = [];
    if (compliance.aa) {
        status.push('<span class="text-success"><i class="fas fa-check-circle"></i> Meets WCAG 2.1 Level AA</span>');
    } else {
        status.push('<span class="text-danger"><i class="fas fa-times-circle"></i> Does not meet WCAG 2.1 Level AA</span>');
    }

    if (compliance.aaa) {
        status.push('<span class="text-success"><i class="fas fa-check-circle"></i> Meets WCAG 2.1 Level AAA</span>');
    } else {
        status.push('<span class="text-warning"><i class="fas fa-exclamation-circle"></i> Does not meet WCAG 2.1 Level AAA</span>');
    }

    accessibilityStatus.innerHTML = status.join('<br>');
}

// Save combination
function saveCombination() {
    const combination = {
        id: Date.now(),
        foreground: foregroundColor.value,
        background: backgroundColor.value,
        ratio: getContrastRatio(foregroundColor.value, backgroundColor.value),
        fontSize: fontSize.value,
        timestamp: new Date().toLocaleString()
    };

    const savedList = JSON.parse(localStorage.getItem('savedContrastCombinations') || '[]');
    savedList.push(combination);
    localStorage.setItem('savedContrastCombinations', JSON.stringify(savedList));

    displaySavedCombinations();
}

// Display saved combinations
function displaySavedCombinations() {
    const savedList = JSON.parse(localStorage.getItem('savedContrastCombinations') || '[]');
    const html = savedList.map(combo => `
        <div class="col-md-6 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Contrast Ratio: ${combo.ratio}:1</h6>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCombination(${combo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="d-flex gap-2 mb-3">
                        <div class="color-swatch" style="background-color: ${combo.foreground}; width: 50px; height: 50px; border-radius: 4px;"></div>
                        <div class="color-swatch" style="background-color: ${combo.background}; width: 50px; height: 50px; border-radius: 4px;"></div>
                    </div>
                    <p class="card-text">
                        <small class="text-muted">
                            Font Size: ${combo.fontSize}px<br>
                            Saved: ${combo.timestamp}
                        </small>
                    </p>
                    <button class="btn btn-sm btn-outline-primary" onclick="loadCombination(${combo.id})">
                        <i class="fas fa-undo"></i> Load Combination
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    savedCombinations.innerHTML = html;
}

// Delete combination
function deleteCombination(id) {
    const savedList = JSON.parse(localStorage.getItem('savedContrastCombinations') || '[]');
    const filteredList = savedList.filter(combo => combo.id !== id);
    localStorage.setItem('savedContrastCombinations', JSON.stringify(filteredList));
    displaySavedCombinations();
}

// Load combination
function loadCombination(id) {
    const savedList = JSON.parse(localStorage.getItem('savedContrastCombinations') || '[]');
    const combination = savedList.find(combo => combo.id === id);
    if (combination) {
        foregroundColor.value = combination.foreground;
        foregroundHex.value = combination.foreground;
        backgroundColor.value = combination.background;
        backgroundHex.value = combination.background;
        fontSize.value = combination.fontSize;
        updateAll();
    }
}

// Update all displays
function updateAll() {
    const ratio = getContrastRatio(foregroundColor.value, backgroundColor.value);
    const compliance = checkWCAGCompliance(ratio, parseInt(fontSize.value));

    contrastRatio.value = ratio;
    wcagLevel.innerHTML = `
        <div class="d-flex justify-content-between">
            <span>Level AA:</span>
            <span class="${compliance.aa ? 'text-success' : 'text-danger'}">
                ${compliance.aa ? 'Pass' : 'Fail'}
            </span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Level AAA:</span>
            <span class="${compliance.aaa ? 'text-success' : 'text-warning'}">
                ${compliance.aaa ? 'Pass' : 'Fail'}
            </span>
        </div>
    `;

    updatePreview();
    updateColorInfo();
    updateAccessibilityStatus(ratio, compliance);
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    navigator.clipboard.writeText(element.value).then(() => {
        // Show feedback
        const button = event.currentTarget;
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = originalContent;
        }, 2000);
    });
}

// Event listeners
foregroundColor.addEventListener('input', (e) => {
    foregroundHex.value = e.target.value;
    updateAll();
});

foregroundHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        foregroundColor.value = hex;
        updateAll();
    }
});

backgroundColor.addEventListener('input', (e) => {
    backgroundHex.value = e.target.value;
    updateAll();
});

backgroundHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        backgroundColor.value = hex;
        updateAll();
    }
});

sampleText.addEventListener('input', updatePreview);
fontSize.addEventListener('change', updateAll);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAll();
    displaySavedCombinations();
}); 
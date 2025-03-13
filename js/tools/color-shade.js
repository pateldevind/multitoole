// DOM Elements
const baseColor = document.getElementById('baseColor');
const baseHex = document.getElementById('baseHex');
const colorName = document.getElementById('colorName');
const numShades = document.getElementById('numShades');
const shadeType = document.getElementById('shadeType');
const colorSpace = document.getElementById('colorSpace');
const contrastRatio = document.getElementById('contrastRatio');
const shadeColors = document.getElementById('shadeColors');
const exportFormat = document.getElementById('exportFormat');
const savedColors = document.getElementById('savedColors');

// Color name mapping
const colorNames = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#008000': 'Dark Green',
    '#000080': 'Navy Blue',
    '#800000': 'Maroon',
    '#808000': 'Olive',
    '#008080': 'Teal',
    '#FFC0CB': 'Pink',
    '#DDA0DD': 'Plum',
    '#F0E68C': 'Khaki',
    '#E6E6FA': 'Lavender',
    '#FFD700': 'Gold',
    '#FFA07A': 'Light Salmon',
    '#98FB98': 'Pale Green'
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

// Generate shades
function generateShades(hex, numShades, type) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const shades = [];

    if (type === 'both' || type === 'shades') {
        // Generate darker shades
        for (let i = 0; i < Math.floor(numShades / 2); i++) {
            const factor = 1 - (i + 1) / (Math.floor(numShades / 2) + 1);
            const newL = hsl.l * factor;
            const newRgb = hslToRgb(hsl.h, hsl.s, newL);
            shades.push({
                hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
                type: 'shade',
                level: i + 1
            });
        }
    }

    // Add base color
    shades.push({
        hex: hex,
        type: 'base',
        level: 0
    });

    if (type === 'both' || type === 'tints') {
        // Generate lighter tints
        for (let i = 0; i < Math.floor(numShades / 2); i++) {
            const factor = 1 + (i + 1) / (Math.floor(numShades / 2) + 1);
            const newL = Math.min(100, hsl.l + (100 - hsl.l) * (i + 1) / (Math.floor(numShades / 2) + 1));
            const newRgb = hslToRgb(hsl.h, hsl.s, newL);
            shades.push({
                hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
                type: 'tint',
                level: i + 1
            });
        }
    }

    return shades;
}

// Create color swatch
function createColorSwatch(color) {
    const rgb = hexToRgb(color.hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const isLight = hsl.l > 50;

    return `
        <div class="col-md-4 col-lg-3">
            <div class="card">
                <div class="color-swatch" style="background-color: ${color.hex}; height: 100px; border-radius: 8px 8px 0 0;"></div>
                <div class="card-body">
                    <h6 class="card-title">${color.type.charAt(0).toUpperCase() + color.type.slice(1)} ${color.level}</h6>
                    <p class="card-text">
                        <small class="text-muted">${color.hex}</small>
                        <button class="btn btn-sm btn-outline-secondary float-end" onclick="copyToClipboard('${color.hex}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </p>
                    <p class="card-text">
                        <small class="text-muted">
                            RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}<br>
                            HSL: ${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%
                        </small>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Update color name
function updateColorName(hex) {
    const closestColor = Object.entries(colorNames).reduce((closest, [color, name]) => {
        const currentDistance = getColorDistance(hex, color);
        return currentDistance < closest.distance ? { color, name, distance: currentDistance } : closest;
    }, { distance: Infinity });

    colorName.value = closestColor.name;
}

// Calculate color distance
function getColorDistance(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
}

// Update shades display
function updateShades() {
    const shades = generateShades(baseColor.value, parseInt(numShades.value), shadeType.value);
    shadeColors.innerHTML = shades.map(createColorSwatch).join('');
    updateColorName(baseColor.value);
}

// Export shades
function exportShades() {
    const shades = generateShades(baseColor.value, parseInt(numShades.value), shadeType.value);
    let exportText = '';

    switch (exportFormat.value) {
        case 'css':
            exportText = `:root {\n${shades.map(shade => `  --color-${shade.type}-${shade.level}: ${shade.hex};`).join('\n')}\n}`;
            break;
        case 'scss':
            exportText = `$colors: (\n${shades.map(shade => `  '${shade.type}-${shade.level}': ${shade.hex},`).join('\n')}\n);`;
            break;
        case 'json':
            exportText = JSON.stringify(shades.reduce((acc, shade) => {
                acc[`${shade.type}-${shade.level}`] = shade.hex;
                return acc;
            }, {}), null, 2);
            break;
        case 'tailwind':
            exportText = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${shades.map(shade => `        '${shade.type}-${shade.level}': '${shade.hex}',`).join('\n')}\n      },\n    },\n  },\n}`;
            break;
    }

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-shades-${Date.now()}.${exportFormat.value}`;
    a.click();
    URL.revokeObjectURL(url);
}

// Save color
function saveColor() {
    const color = {
        id: Date.now(),
        name: colorName.value,
        hex: baseColor.value,
        shades: generateShades(baseColor.value, parseInt(numShades.value), shadeType.value)
    };

    const savedColorsList = JSON.parse(localStorage.getItem('savedColors') || '[]');
    savedColorsList.push(color);
    localStorage.setItem('savedColors', JSON.stringify(savedColorsList));

    displaySavedColors();
}

// Display saved colors
function displaySavedColors() {
    const savedColorsList = JSON.parse(localStorage.getItem('savedColors') || '[]');
    const html = savedColorsList.map(color => `
        <div class="col-md-6 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${color.name}</h6>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteColor(${color.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="color-swatch mb-3" style="background-color: ${color.hex}; height: 100px; border-radius: 8px;"></div>
                    <div class="row g-2">
                        ${color.shades.map(createColorSwatch).join('')}
                    </div>
                    <button class="btn btn-sm btn-outline-primary mt-3" onclick="loadColor(${color.id})">
                        <i class="fas fa-undo"></i> Load Color
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    savedColors.innerHTML = html;
}

// Delete color
function deleteColor(id) {
    const savedColorsList = JSON.parse(localStorage.getItem('savedColors') || '[]');
    const filteredColors = savedColorsList.filter(c => c.id !== id);
    localStorage.setItem('savedColors', JSON.stringify(filteredColors));
    displaySavedColors();
}

// Load color
function loadColor(id) {
    const savedColorsList = JSON.parse(localStorage.getItem('savedColors') || '[]');
    const color = savedColorsList.find(c => c.id === id);
    if (color) {
        baseColor.value = color.hex;
        baseHex.value = color.hex;
        updateShades();
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
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
baseColor.addEventListener('input', (e) => {
    baseHex.value = e.target.value;
    updateShades();
});

baseHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        baseColor.value = hex;
        updateShades();
    }
});

numShades.addEventListener('change', updateShades);
shadeType.addEventListener('change', updateShades);
colorSpace.addEventListener('change', updateShades);
contrastRatio.addEventListener('input', updateShades);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateShades();
    displaySavedColors();
}); 
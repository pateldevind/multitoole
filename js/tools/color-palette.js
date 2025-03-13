// DOM Elements
const baseColor = document.getElementById('baseColor');
const baseHex = document.getElementById('baseHex');
const colorName = document.getElementById('colorName');
const colorPreview = document.getElementById('colorPreview');
const colorInfo = document.getElementById('colorInfo');
const paletteType = document.getElementById('paletteType');
const colorCount = document.getElementById('colorCount');
const includeShades = document.getElementById('includeShades');
const includeTints = document.getElementById('includeTints');
const colorSpace = document.getElementById('colorSpace');
const paletteColors = document.getElementById('paletteColors');
const paletteName = document.getElementById('paletteName');
const exportFormat = document.getElementById('exportFormat');
const savedPalettes = document.getElementById('savedPalettes');

// Color name mapping
const colorNames = {
    '#FF0000': 'Red',
    '#FF7F00': 'Orange',
    '#FFFF00': 'Yellow',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#4B0082': 'Indigo',
    '#9400D3': 'Violet',
    '#FF5733': 'Coral',
    '#FF69B4': 'Hot Pink',
    '#FFD700': 'Gold',
    '#00CED1': 'Dark Turquoise',
    '#8B4513': 'Saddle Brown',
    '#808080': 'Gray',
    '#000000': 'Black',
    '#FFFFFF': 'White'
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

// Generate color variations
function generateVariations(hex, type) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const variations = [];

    switch (type) {
        case 'shade':
            for (let i = 0; i <= 100; i += 20) {
                if (i === 50) continue; // Skip the original color
                const newHsl = { ...hsl, l: i };
                const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                variations.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
        case 'tint':
            for (let i = 0; i <= 100; i += 20) {
                if (i === 50) continue; // Skip the original color
                const newHsl = { ...hsl, l: 100 - i };
                const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                variations.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
    }

    return variations;
}

// Generate harmonious colors
function generateHarmoniousColors(hex, type) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [hex];

    switch (type) {
        case 'complementary':
            colors.push(rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b));
            break;
        case 'triadic':
            colors.push(rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b));
            colors.push(rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b));
            break;
        case 'analogous':
            const h1 = (hsl.h + 30) % 360;
            const h2 = (hsl.h - 30 + 360) % 360;
            colors.push(rgbToHex(...Object.values(hslToRgb(h1, hsl.s, hsl.l))));
            colors.push(rgbToHex(...Object.values(hslToRgb(h2, hsl.s, hsl.l))));
            break;
        case 'split-complementary':
            const h3 = (hsl.h + 150) % 360;
            const h4 = (hsl.h - 150 + 360) % 360;
            colors.push(rgbToHex(...Object.values(hslToRgb(h3, hsl.s, hsl.l))));
            colors.push(rgbToHex(...Object.values(hslToRgb(h4, hsl.s, hsl.l))));
            break;
        case 'tetradic':
            const h5 = (hsl.h + 90) % 360;
            const h6 = (hsl.h + 180) % 360;
            const h7 = (hsl.h + 270) % 360;
            colors.push(rgbToHex(...Object.values(hslToRgb(h5, hsl.s, hsl.l))));
            colors.push(rgbToHex(...Object.values(hslToRgb(h6, hsl.s, hsl.l))));
            colors.push(rgbToHex(...Object.values(hslToRgb(h7, hsl.s, hsl.l))));
            break;
        case 'monochromatic':
            for (let i = 0; i <= 100; i += 25) {
                if (i === 50) continue; // Skip the original color
                const newHsl = { ...hsl, l: i };
                const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
    }

    return colors.slice(0, parseInt(colorCount.value));
}

// Create color swatch
function createColorSwatch(hex) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return `
        <div class="col-md-4">
            <div class="card h-100">
                <div class="color-swatch" style="background-color: ${hex}; height: 100px;"></div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <input type="text" class="form-control form-control-sm" value="${hex}" readonly>
                        <button class="btn btn-sm btn-outline-secondary" onclick="copyToClipboard('${hex}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}</small><br>
                        <small class="text-muted">HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update palette
function updatePalette() {
    const hex = baseHex.value;
    const colors = generateHarmoniousColors(hex, paletteType.value);
    let variations = [];

    if (includeShades.checked) {
        variations = variations.concat(generateVariations(hex, 'shade'));
    }
    if (includeTints.checked) {
        variations = variations.concat(generateVariations(hex, 'tint'));
    }

    const allColors = [...new Set([...colors, ...variations])];
    paletteColors.innerHTML = allColors.map(createColorSwatch).join('');
}

// Export palette
function exportPalette() {
    const colors = Array.from(paletteColors.querySelectorAll('.color-swatch'))
        .map(swatch => swatch.style.backgroundColor);
    let exportText = '';

    switch (exportFormat.value) {
        case 'css':
            exportText = `:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
            break;
        case 'scss':
            exportText = `$colors: (\n${colors.map((color, i) => `  'color-${i + 1}': ${color},`).join('\n')}\n);`;
            break;
        case 'json':
            exportText = JSON.stringify({ colors }, null, 2);
            break;
        case 'tailwind':
            exportText = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors.map((color, i) => `        'color-${i + 1}': '${color}',`).join('\n')}\n      }\n    }\n  }\n}`;
            break;
    }

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${baseHex.value.slice(1)}.${exportFormat.value}`;
    a.click();
    URL.revokeObjectURL(url);
}

// Save palette
function savePalette() {
    const colors = Array.from(paletteColors.querySelectorAll('.color-swatch'))
        .map(swatch => swatch.style.backgroundColor);
    const palette = {
        id: Date.now(),
        name: `Palette ${new Date().toLocaleDateString()}`,
        colors,
        baseColor: baseHex.value,
        type: paletteType.value
    };

    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    savedPalettes.push(palette);
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));

    displaySavedPalettes();
}

// Display saved palettes
function displaySavedPalettes() {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    const html = savedPalettes.map(palette => `
        <div class="col-md-6 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${palette.name}</h6>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePalette(${palette.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        ${palette.colors.map(color => `
                            <div class="color-swatch" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 4px;"></div>
                        `).join('')}
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="loadPalette(${palette.id})">
                        <i class="fas fa-undo"></i> Load Palette
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('savedPalettes').innerHTML = html;
}

// Delete palette
function deletePalette(id) {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    const filteredPalettes = savedPalettes.filter(p => p.id !== id);
    localStorage.setItem('savedPalettes', JSON.stringify(filteredPalettes));
    displaySavedPalettes();
}

// Load palette
function loadPalette(id) {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    const palette = savedPalettes.find(p => p.id === id);
    if (palette) {
        baseColor.value = palette.baseColor;
        baseHex.value = palette.baseColor;
        paletteType.value = palette.type;
        updatePalette();
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

// Find closest named color
function findClosestNamedColor(hex) {
    const rgb = hexToRgb(hex);
    let closest = null;
    let minDistance = Infinity;

    for (const [namedHex, name] of Object.entries(colorNames)) {
        const namedRgb = hexToRgb(namedHex);
        const distance = Math.sqrt(
            Math.pow(rgb.r - namedRgb.r, 2) +
            Math.pow(rgb.g - namedRgb.g, 2) +
            Math.pow(rgb.b - namedRgb.b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closest = name;
        }
    }

    return closest;
}

// Event listeners
baseColor.addEventListener('input', (e) => {
    baseHex.value = e.target.value;
    colorName.value = findClosestNamedColor(e.target.value);
    updatePalette();
});

baseHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        baseColor.value = hex;
        colorName.value = findClosestNamedColor(hex);
        updatePalette();
    }
});

paletteType.addEventListener('change', updatePalette);
colorCount.addEventListener('change', updatePalette);
includeShades.addEventListener('change', updatePalette);
includeTints.addEventListener('change', updatePalette);
colorSpace.addEventListener('change', () => updatePalette());

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updatePalette();
    displaySavedPalettes();
}); 
// DOM Elements
const temperature = document.getElementById('temperature');
const temperatureRange = document.getElementById('temperatureRange');
const presetSource = document.getElementById('presetSource');
const lightSourcePreview = document.getElementById('lightSourcePreview');
const rgbValues = document.getElementById('rgbValues');
const temperatureScale = document.getElementById('temperatureScale');

// Color temperature to RGB conversion
function temperatureToRGB(kelvin) {
    let temp = kelvin / 100;
    let red, green, blue;

    // Calculate red
    if (temp <= 66) {
        red = 255;
    } else {
        red = temp - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        red = Math.min(255, Math.max(0, red));
    }

    // Calculate green
    if (temp <= 66) {
        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;
        green = Math.min(255, Math.max(0, green));
    } else {
        green = temp - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492);
        green = Math.min(255, Math.max(0, green));
    }

    // Calculate blue
    if (temp >= 66) {
        blue = 255;
    } else if (temp <= 19) {
        blue = 0;
    } else {
        blue = temp - 10;
        blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        blue = Math.min(255, Math.max(0, blue));
    }

    return {
        r: Math.round(red),
        g: Math.round(green),
        b: Math.round(blue)
    };
}

// Generate temperature scale gradient
function generateTemperatureScale() {
    const gradient = [];
    for (let i = 1000; i <= 12000; i += 100) {
        const rgb = temperatureToRGB(i);
        const percentage = ((i - 1000) / (12000 - 1000)) * 100;
        gradient.push(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) ${percentage}%`);
    }
    return gradient.join(', ');
}

// Update light source preview
function updatePreview() {
    const rgb = temperatureToRGB(parseInt(temperature.value));
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    // Update preview color
    lightSourcePreview.style.backgroundColor = hex;
    
    // Update RGB values
    rgbValues.innerHTML = `
        <strong>RGB:</strong> ${rgb.r}, ${rgb.g}, ${rgb.b}<br>
        <strong>HEX:</strong> ${hex}<br>
        <strong>Temperature:</strong> ${temperature.value}K
    `;
}

// Convert RGB to Hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Update temperature scale
function updateTemperatureScale() {
    temperatureScale.style.background = `linear-gradient(to right, ${generateTemperatureScale()})`;
}

// Update all displays
function updateAll() {
    updatePreview();
    updateTemperatureScale();
}

// Event listeners
temperature.addEventListener('input', (e) => {
    temperatureRange.value = e.target.value;
    updateAll();
});

temperatureRange.addEventListener('input', (e) => {
    temperature.value = e.target.value;
    updateAll();
});

presetSource.addEventListener('change', (e) => {
    if (e.target.value) {
        temperature.value = e.target.value;
        temperatureRange.value = e.target.value;
        updateAll();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAll();
}); 
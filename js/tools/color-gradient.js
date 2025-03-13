// DOM Elements
const startColor = document.getElementById('startColor');
const startHex = document.getElementById('startHex');
const endColor = document.getElementById('endColor');
const endHex = document.getElementById('endHex');
const gradientType = document.getElementById('gradientType');
const direction = document.getElementById('direction');
const colorStops = document.getElementById('colorStops');
const size = document.getElementById('size');
const gradientPreview = document.getElementById('gradientPreview');
const exportFormat = document.getElementById('exportFormat');
const savedGradients = document.getElementById('savedGradients');

// Add color stop
function addColorStop() {
    const stop = document.createElement('div');
    stop.className = 'input-group mb-2';
    stop.innerHTML = `
        <input type="color" class="form-control form-control-color" value="#808080">
        <input type="number" class="form-control" value="50" min="0" max="100">
        <span class="input-group-text">%</span>
        <button class="btn btn-outline-danger" type="button" onclick="removeColorStop(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    colorStops.appendChild(stop);
    updateGradient();
}

// Remove color stop
function removeColorStop(button) {
    const stop = button.closest('.input-group');
    if (colorStops.children.length > 2) {
        stop.remove();
        updateGradient();
    }
}

// Get color stops
function getColorStops() {
    return Array.from(colorStops.children).map(stop => {
        const color = stop.querySelector('input[type="color"]').value;
        const position = stop.querySelector('input[type="number"]').value;
        return { color, position };
    }).sort((a, b) => a.position - b.position);
}

// Generate gradient CSS
function generateGradientCSS() {
    const stops = getColorStops();
    const stopsCSS = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    const sizeValue = size.value + '%';

    switch (gradientType.value) {
        case 'linear':
            return `linear-gradient(${direction.value}, ${stopsCSS})`;
        case 'radial':
            return `radial-gradient(circle at center, ${stopsCSS})`;
        case 'conic':
            return `conic-gradient(from 0deg at center, ${stopsCSS})`;
        default:
            return `linear-gradient(to right, ${stopsCSS})`;
    }
}

// Update gradient preview
function updateGradient() {
    const gradientCSS = generateGradientCSS();
    gradientPreview.style.background = gradientCSS;
    gradientPreview.style.width = size.value + '%';
    gradientPreview.style.height = '200px';
    gradientPreview.style.borderRadius = '8px';
}

// Export gradient
function exportGradient() {
    const gradientCSS = generateGradientCSS();
    let exportText = '';

    switch (exportFormat.value) {
        case 'css':
            exportText = `.gradient {\n  background: ${gradientCSS};\n}`;
            break;
        case 'scss':
            exportText = `$gradient: ${gradientCSS};\n\n.gradient {\n  background: $gradient;\n}`;
            break;
        case 'tailwind':
            exportText = `module.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'custom-gradient': '${gradientCSS}',\n      },\n    },\n  },\n}`;
            break;
    }

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradient-${Date.now()}.${exportFormat.value}`;
    a.click();
    URL.revokeObjectURL(url);
}

// Save gradient
function saveGradient() {
    const gradient = {
        id: Date.now(),
        name: `Gradient ${new Date().toLocaleDateString()}`,
        css: generateGradientCSS(),
        stops: getColorStops(),
        type: gradientType.value,
        direction: direction.value,
        size: size.value
    };

    const savedGradientsList = JSON.parse(localStorage.getItem('savedGradients') || '[]');
    savedGradientsList.push(gradient);
    localStorage.setItem('savedGradients', JSON.stringify(savedGradientsList));

    displaySavedGradients();
}

// Display saved gradients
function displaySavedGradients() {
    const savedGradientsList = JSON.parse(localStorage.getItem('savedGradients') || '[]');
    const html = savedGradientsList.map(gradient => `
        <div class="col-md-6 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${gradient.name}</h6>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGradient(${gradient.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="gradient-preview mb-3" style="background: ${gradient.css}; height: 100px; border-radius: 8px;"></div>
                    <button class="btn btn-sm btn-outline-primary" onclick="loadGradient(${gradient.id})">
                        <i class="fas fa-undo"></i> Load Gradient
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    savedGradients.innerHTML = html;
}

// Delete gradient
function deleteGradient(id) {
    const savedGradientsList = JSON.parse(localStorage.getItem('savedGradients') || '[]');
    const filteredGradients = savedGradientsList.filter(g => g.id !== id);
    localStorage.setItem('savedGradients', JSON.stringify(filteredGradients));
    displaySavedGradients();
}

// Load gradient
function loadGradient(id) {
    const savedGradientsList = JSON.parse(localStorage.getItem('savedGradients') || '[]');
    const gradient = savedGradientsList.find(g => g.id === id);
    if (gradient) {
        // Clear existing color stops
        colorStops.innerHTML = '';
        
        // Add color stops
        gradient.stops.forEach(stop => {
            const stopElement = document.createElement('div');
            stopElement.className = 'input-group mb-2';
            stopElement.innerHTML = `
                <input type="color" class="form-control form-control-color" value="${stop.color}">
                <input type="number" class="form-control" value="${stop.position}" min="0" max="100">
                <span class="input-group-text">%</span>
                <button class="btn btn-outline-danger" type="button" onclick="removeColorStop(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            colorStops.appendChild(stopElement);
        });

        // Set other values
        gradientType.value = gradient.type;
        direction.value = gradient.direction;
        size.value = gradient.size;

        updateGradient();
    }
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
startColor.addEventListener('input', (e) => {
    startHex.value = e.target.value;
    updateGradient();
});

startHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        startColor.value = hex;
        updateGradient();
    }
});

endColor.addEventListener('input', (e) => {
    endHex.value = e.target.value;
    updateGradient();
});

endHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        endColor.value = hex;
        updateGradient();
    }
});

gradientType.addEventListener('change', updateGradient);
direction.addEventListener('change', updateGradient);
size.addEventListener('input', updateGradient);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateGradient();
    displaySavedGradients();
}); 
// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const outputContainer = document.getElementById('outputContainer');
const outputImage = document.getElementById('outputImage');
const resizingSpinner = document.getElementById('resizingSpinner');
const originalSize = document.getElementById('originalSize');
const newSize = document.getElementById('newSize');

// Resize options
const resizeMethod = document.getElementById('resizeMethod');
const percentageOption = document.getElementById('percentageOption');
const dimensionsOption = document.getElementById('dimensionsOption');
const presetOption = document.getElementById('presetOption');
const scalePercentage = document.getElementById('scalePercentage');
const scaleValue = document.getElementById('scaleValue');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const maintainAspectRatio = document.getElementById('maintainAspectRatio');
const presetSize = document.getElementById('presetSize');
const presetDetails = document.getElementById('presetDetails');
const outputFormat = document.getElementById('outputFormat');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');

// Preset sizes configuration
const presetSizes = {
    social: {
        facebook: { width: 1200, height: 630, name: 'Facebook Post' },
        instagram: { width: 1080, height: 1080, name: 'Instagram Square' },
        twitter: { width: 1200, height: 675, name: 'Twitter Post' },
        linkedin: { width: 1200, height: 627, name: 'LinkedIn Post' }
    },
    profile: {
        small: { width: 150, height: 150, name: 'Small Profile' },
        medium: { width: 300, height: 300, name: 'Medium Profile' },
        large: { width: 500, height: 500, name: 'Large Profile' }
    },
    banner: {
        small: { width: 800, height: 200, name: 'Small Banner' },
        medium: { width: 1200, height: 300, name: 'Medium Banner' },
        large: { width: 1920, height: 480, name: 'Large Banner' }
    },
    thumbnail: {
        small: { width: 150, height: 150, name: 'Small Thumbnail' },
        medium: { width: 300, height: 300, name: 'Medium Thumbnail' },
        large: { width: 500, height: 500, name: 'Large Thumbnail' }
    }
};

// Drag and Drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-primary');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-primary');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-primary');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// File input change handler
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// Resize method change handler
resizeMethod.addEventListener('change', () => {
    percentageOption.classList.add('d-none');
    dimensionsOption.classList.add('d-none');
    presetOption.classList.add('d-none');
    
    switch(resizeMethod.value) {
        case 'percentage':
            percentageOption.classList.remove('d-none');
            break;
        case 'dimensions':
            dimensionsOption.classList.remove('d-none');
            break;
        case 'preset':
            presetOption.classList.remove('d-none');
            updatePresetDetails();
            break;
    }
});

// Scale percentage handler
scalePercentage.addEventListener('input', (e) => {
    scaleValue.textContent = `${e.target.value}%`;
    if (imagePreview.src) {
        resizeImage();
    }
});

// Width/Height input handlers
widthInput.addEventListener('input', () => {
    if (maintainAspectRatio.checked) {
        updateHeight();
    }
    if (imagePreview.src) {
        resizeImage();
    }
});

heightInput.addEventListener('input', () => {
    if (maintainAspectRatio.checked) {
        updateWidth();
    }
    if (imagePreview.src) {
        resizeImage();
    }
});

// Maintain aspect ratio checkbox handler
maintainAspectRatio.addEventListener('change', () => {
    if (maintainAspectRatio.checked) {
        updateHeight();
    }
});

// Preset size change handler
presetSize.addEventListener('change', updatePresetDetails);

// Output format change handler
outputFormat.addEventListener('change', () => {
    if (imagePreview.src) {
        resizeImage();
    }
});

// Quality slider handler
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    if (imagePreview.src) {
        resizeImage();
    }
});

// Handle image upload
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.classList.remove('d-none');
        originalSize.textContent = `${file.width || 'N/A'} x ${file.height || 'N/A'}`;
        resizeImage();
    };
    reader.readAsDataURL(file);
}

// Clear image
function clearImage() {
    imagePreview.src = '';
    outputImage.src = '';
    previewContainer.classList.add('d-none');
    outputContainer.classList.add('d-none');
    originalSize.textContent = '-';
    newSize.textContent = '-';
    widthInput.value = '';
    heightInput.value = '';
}

// Update height based on width while maintaining aspect ratio
function updateHeight() {
    if (imagePreview.src && widthInput.value) {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.height / img.width;
            heightInput.value = Math.round(widthInput.value * aspectRatio);
        };
        img.src = imagePreview.src;
    }
}

// Update width based on height while maintaining aspect ratio
function updateWidth() {
    if (imagePreview.src && heightInput.value) {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        };
        img.src = imagePreview.src;
    }
}

// Update preset details
function updatePresetDetails() {
    const category = presetSize.value;
    const presets = presetSizes[category];
    let details = '<div class="row">';
    
    for (const [key, preset] of Object.entries(presets)) {
        details += `
            <div class="col-md-4 mb-2">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="presetSize" value="${key}" 
                           onchange="selectPreset('${category}', '${key}')">
                    <label class="form-check-label">
                        ${preset.name}<br>
                        <small class="text-muted">${preset.width}x${preset.height}</small>
                    </label>
                </div>
            </div>
        `;
    }
    
    details += '</div>';
    presetDetails.innerHTML = details;
}

// Select preset size
function selectPreset(category, key) {
    const preset = presetSizes[category][key];
    widthInput.value = preset.width;
    heightInput.value = preset.height;
    resizeImage();
}

// Resize image
function resizeImage() {
    const img = new Image();
    img.onload = () => {
        // Show resizing spinner
        resizingSpinner.classList.remove('d-none');
        outputContainer.classList.add('d-none');

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        let newWidth = img.width;
        let newHeight = img.height;

        switch(resizeMethod.value) {
            case 'percentage':
                const scale = scalePercentage.value / 100;
                newWidth = Math.round(img.width * scale);
                newHeight = Math.round(img.height * scale);
                break;
            case 'dimensions':
                if (widthInput.value && heightInput.value) {
                    newWidth = parseInt(widthInput.value);
                    newHeight = parseInt(heightInput.value);
                }
                break;
        }

        // Update size display
        newSize.textContent = `${newWidth} x ${newHeight}`;

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to selected format
        const format = outputFormat.value === 'original' ? 'image/png' : `image/${outputFormat.value}`;
        const quality = qualitySlider.value / 100;
        const dataUrl = canvas.toDataURL(format, quality);

        // Update output
        outputImage.src = dataUrl;
        outputContainer.classList.remove('d-none');
        resizingSpinner.classList.add('d-none');
    };
    img.src = imagePreview.src;
}

// Download resized image
function downloadImage() {
    const format = outputFormat.value === 'original' ? 'png' : outputFormat.value;
    const link = document.createElement('a');
    link.download = `resized-image.${format}`;
    link.href = outputImage.src;
    link.click();
} 
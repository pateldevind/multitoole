// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const outputContainer = document.getElementById('outputContainer');
const outputImage = document.getElementById('outputImage');
const convertingSpinner = document.getElementById('convertingSpinner');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const maintainAspectRatio = document.getElementById('maintainAspectRatio');

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

// Quality slider handler
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    if (imagePreview.src) {
        convertImage();
    }
});

// Width/Height input handlers
widthInput.addEventListener('input', () => {
    if (maintainAspectRatio.checked) {
        updateHeight();
    }
    if (imagePreview.src) {
        convertImage();
    }
});

heightInput.addEventListener('input', () => {
    if (maintainAspectRatio.checked) {
        updateWidth();
    }
    if (imagePreview.src) {
        convertImage();
    }
});

// Maintain aspect ratio checkbox handler
maintainAspectRatio.addEventListener('change', () => {
    if (maintainAspectRatio.checked) {
        updateHeight();
    }
});

// Handle image upload
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.classList.remove('d-none');
        convertImage();
    };
    reader.readAsDataURL(file);
}

// Clear image
function clearImage() {
    imagePreview.src = '';
    outputImage.src = '';
    previewContainer.classList.add('d-none');
    outputContainer.classList.add('d-none');
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

// Convert image to PNG
function convertImage() {
    const img = new Image();
    img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set dimensions
        let width = img.width;
        let height = img.height;

        if (widthInput.value && heightInput.value) {
            width = parseInt(widthInput.value);
            height = parseInt(heightInput.value);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to PNG
        const quality = qualitySlider.value / 100;
        const pngDataUrl = canvas.toDataURL('image/png', quality);

        // Update output
        outputImage.src = pngDataUrl;
        outputContainer.classList.remove('d-none');
    };
    img.src = imagePreview.src;
}

// Download PNG
function downloadPNG() {
    const link = document.createElement('a');
    link.download = 'converted-image.png';
    link.href = outputImage.src;
    link.click();
} 
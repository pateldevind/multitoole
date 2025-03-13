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
const backgroundColor = document.getElementById('backgroundColor');
const progressiveJPG = document.getElementById('progressiveJPG');

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

// Background color change handler
backgroundColor.addEventListener('input', () => {
    if (imagePreview.src) {
        convertImage();
    }
});

// Progressive JPG checkbox handler
progressiveJPG.addEventListener('change', () => {
    if (imagePreview.src) {
        convertImage();
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

// Convert image to JPG
function convertImage() {
    const img = new Image();
    img.onload = () => {
        // Show converting spinner
        convertingSpinner.classList.remove('d-none');
        outputContainer.classList.add('d-none');

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

        // Fill background color
        ctx.fillStyle = backgroundColor.value;
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPG with quality settings
        const quality = qualitySlider.value / 100;
        const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Update output
        outputImage.src = jpgDataUrl;
        outputContainer.classList.remove('d-none');
        convertingSpinner.classList.add('d-none');
    };
    img.src = imagePreview.src;
}

// Download JPG
function downloadJPG() {
    const link = document.createElement('a');
    link.download = 'converted-image.jpg';
    link.href = outputImage.src;
    link.click();
} 
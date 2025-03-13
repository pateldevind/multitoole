// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const outputContainer = document.getElementById('outputContainer');
const outputImage = document.getElementById('outputImage');
const compressingSpinner = document.getElementById('compressingSpinner');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const reductionPercentage = document.getElementById('reductionPercentage');

// Compression options
const compressionLevel = document.getElementById('compressionLevel');
const customSettings = document.getElementById('customSettings');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const maxFileSize = document.getElementById('maxFileSize');
const outputFormat = document.getElementById('outputFormat');
const maxWidth = document.getElementById('maxWidth');
const maxHeight = document.getElementById('maxHeight');
const maintainAspectRatio = document.getElementById('maintainAspectRatio');
const stripMetadata = document.getElementById('stripMetadata');
const progressiveJPG = document.getElementById('progressiveJPG');

// Compression level presets
const compressionPresets = {
    low: {
        quality: 90,
        maxWidth: 1920,
        maxHeight: 1080,
        stripMetadata: true,
        progressiveJPG: true
    },
    medium: {
        quality: 80,
        maxWidth: 1600,
        maxHeight: 900,
        stripMetadata: true,
        progressiveJPG: true
    },
    high: {
        quality: 60,
        maxWidth: 1280,
        maxHeight: 720,
        stripMetadata: true,
        progressiveJPG: true
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

// Compression level change handler
compressionLevel.addEventListener('change', () => {
    if (compressionLevel.value === 'custom') {
        customSettings.classList.remove('d-none');
    } else {
        customSettings.classList.add('d-none');
        applyPreset(compressionLevel.value);
    }
});

// Quality slider handler
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    if (imagePreview.src) {
        compressImage();
    }
});

// Max file size change handler
maxFileSize.addEventListener('input', () => {
    if (imagePreview.src) {
        compressImage();
    }
});

// Max dimensions change handlers
maxWidth.addEventListener('input', () => {
    if (maintainAspectRatio.checked) {
        updateMaxHeight();
    }
    if (imagePreview.src) {
        compressImage();
    }
});

maxHeight.addEventListener('input', () => {
    if (maintainAspectRatio.checked) {
        updateMaxWidth();
    }
    if (imagePreview.src) {
        compressImage();
    }
});

// Maintain aspect ratio checkbox handler
maintainAspectRatio.addEventListener('change', () => {
    if (maintainAspectRatio.checked) {
        updateMaxHeight();
    }
});

// Output format change handler
outputFormat.addEventListener('change', () => {
    if (imagePreview.src) {
        compressImage();
    }
});

// Handle image upload
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.classList.remove('d-none');
        originalSize.textContent = formatFileSize(file.size);
        compressImage();
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
    compressedSize.textContent = '-';
    reductionPercentage.textContent = '-';
}

// Update max height based on max width while maintaining aspect ratio
function updateMaxHeight() {
    if (imagePreview.src && maxWidth.value) {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.height / img.width;
            maxHeight.value = Math.round(maxWidth.value * aspectRatio);
        };
        img.src = imagePreview.src;
    }
}

// Update max width based on max height while maintaining aspect ratio
function updateMaxWidth() {
    if (imagePreview.src && maxHeight.value) {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            maxWidth.value = Math.round(maxHeight.value * aspectRatio);
        };
        img.src = imagePreview.src;
    }
}

// Apply compression preset
function applyPreset(preset) {
    const settings = compressionPresets[preset];
    qualitySlider.value = settings.quality;
    qualityValue.textContent = `${settings.quality}%`;
    maxWidth.value = settings.maxWidth;
    maxHeight.value = settings.maxHeight;
    stripMetadata.checked = settings.stripMetadata;
    progressiveJPG.checked = settings.progressiveJPG;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Calculate file size from data URL
function getFileSize(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    return Math.round((base64.length * 3) / 4);
}

// Compress image
function compressImage() {
    const img = new Image();
    img.onload = () => {
        // Show compressing spinner
        compressingSpinner.classList.remove('d-none');
        outputContainer.classList.add('d-none');

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        // Apply max dimensions if specified
        if (maxWidth.value && maxHeight.value) {
            const maxW = parseInt(maxWidth.value);
            const maxH = parseInt(maxHeight.value);
            
            if (width > maxW || height > maxH) {
                const ratio = Math.min(maxW / width, maxH / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to selected format
        const format = outputFormat.value === 'original' ? 'image/png' : `image/${outputFormat.value}`;
        const quality = qualitySlider.value / 100;
        let dataUrl = canvas.toDataURL(format, quality);

        // Check if max file size is specified
        if (maxFileSize.value) {
            const maxBytes = parseInt(maxFileSize.value) * 1024;
            let currentQuality = quality;
            
            while (getFileSize(dataUrl) > maxBytes && currentQuality > 0.1) {
                currentQuality -= 0.1;
                dataUrl = canvas.toDataURL(format, currentQuality);
            }
        }

        // Update output
        outputImage.src = dataUrl;
        
        // Update size information
        const originalBytes = getFileSize(imagePreview.src);
        const compressedBytes = getFileSize(dataUrl);
        const reduction = ((originalBytes - compressedBytes) / originalBytes) * 100;
        
        compressedSize.textContent = formatFileSize(compressedBytes);
        reductionPercentage.textContent = `${reduction.toFixed(1)}%`;
        
        outputContainer.classList.remove('d-none');
        compressingSpinner.classList.add('d-none');
    };
    img.src = imagePreview.src;
}

// Download compressed image
function downloadImage() {
    const format = outputFormat.value === 'original' ? 'png' : outputFormat.value;
    const link = document.createElement('a');
    link.download = `compressed-image.${format}`;
    link.href = outputImage.src;
    link.click();
} 
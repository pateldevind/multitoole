// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const imageList = document.getElementById('imageList');
const pageSize = document.getElementById('pageSize');
const pageOrientation = document.getElementById('pageOrientation');
const imageQuality = document.getElementById('imageQuality');
const imageFit = document.getElementById('imageFit');
const convertToPDF = document.getElementById('convertToPDF');
const clearImages = document.getElementById('clearImages');
const reorderImages = document.getElementById('reorderImages');
const outputContainer = document.getElementById('outputContainer');
const downloadPDF = document.getElementById('downloadPDF');

// State
let images = [];
let currentPDF = null;

// Page dimensions (in points, 1 point = 1/72 inch)
const pageDimensions = {
    a4: { width: 595, height: 842 },
    letter: { width: 612, height: 792 },
    legal: { width: 612, height: 1008 }
};

// Handle image upload
imageUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Process each image
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        try {
            const img = await loadImage(file);
            images.push({
                element: img,
                file: file
            });
            addImageToList(img, images.length - 1);
        } catch (error) {
            console.error('Error loading image:', error);
            alert(`Error loading image: ${file.name}`);
        }
    }

    // Enable/disable buttons
    updateButtonStates();
});

// Load image from file
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// Add image to the list
function addImageToList(img, index) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item d-flex align-items-center mb-2 p-2 border rounded';
    imageItem.innerHTML = `
        <img src="${img.src}" class="me-2" style="width: 100px; height: 100px; object-fit: cover;">
        <div class="flex-grow-1">
            <div>${img.file.name}</div>
            <small class="text-muted">${img.width}x${img.height}px</small>
        </div>
        <button class="btn btn-sm btn-danger ms-2" onclick="removeImage(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    imageList.appendChild(imageItem);
}

// Remove image
function removeImage(index) {
    URL.revokeObjectURL(images[index].element.src);
    images.splice(index, 1);
    updateImageList();
    updateButtonStates();
}

// Update image list
function updateImageList() {
    imageList.innerHTML = '';
    if (images.length === 0) {
        imageList.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-images fa-3x"></i>
                <p class="mt-2">No images uploaded yet</p>
            </div>
        `;
        return;
    }

    images.forEach((img, index) => {
        addImageToList(img.element, index);
    });
}

// Update button states
function updateButtonStates() {
    convertToPDF.disabled = images.length === 0;
    downloadPDF.disabled = currentPDF === null;
}

// Get page dimensions based on settings
function getPageDimensions() {
    const size = pageSize.value;
    const orientation = pageOrientation.value;
    let dimensions = { ...pageDimensions[size] };

    if (orientation === 'landscape') {
        [dimensions.width, dimensions.height] = [dimensions.height, dimensions.width];
    }

    return dimensions;
}

// Calculate image dimensions based on fit mode
function calculateImageDimensions(img, pageWidth, pageHeight) {
    const imgWidth = img.width;
    const imgHeight = img.height;
    const imgAspect = imgWidth / imgHeight;
    const pageAspect = pageWidth / pageHeight;

    let width, height;

    switch (imageFit.value) {
        case 'contain':
            if (imgAspect > pageAspect) {
                width = pageWidth;
                height = width / imgAspect;
            } else {
                height = pageHeight;
                width = height * imgAspect;
            }
            break;
        case 'cover':
            if (imgAspect > pageAspect) {
                height = pageHeight;
                width = height * imgAspect;
            } else {
                width = pageWidth;
                height = width / imgAspect;
            }
            break;
        case 'original':
            width = imgWidth;
            height = imgHeight;
            break;
    }

    return { width, height };
}

// Convert images to PDF
convertToPDF.addEventListener('click', async () => {
    if (images.length === 0) return;

    try {
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: pageOrientation.value,
            unit: 'pt',
            format: pageSize.value
        });

        // Process each image
        for (let i = 0; i < images.length; i++) {
            const img = images[i].element;
            const pageDimensions = getPageDimensions();
            const { width, height } = calculateImageDimensions(img, pageDimensions.width, pageDimensions.height);

            // Add new page if not first image
            if (i > 0) {
                doc.addPage();
            }

            // Add image to page
            doc.addImage(
                img.src,
                'JPEG',
                (pageDimensions.width - width) / 2,
                (pageDimensions.height - height) / 2,
                width,
                height,
                undefined,
                'FAST'
            );
        }

        // Save PDF
        currentPDF = doc;
        outputContainer.innerHTML = `
            <div class="alert alert-success">
                PDF created successfully with ${images.length} pages!
            </div>
        `;
        downloadPDF.disabled = false;
    } catch (error) {
        console.error('Error creating PDF:', error);
        outputContainer.innerHTML = `
            <div class="alert alert-danger">
                Error creating PDF: ${error.message}
            </div>
        `;
    }
});

// Download PDF
downloadPDF.addEventListener('click', () => {
    if (!currentPDF) return;
    currentPDF.save('screenshots.pdf');
});

// Clear images
clearImages.addEventListener('click', () => {
    // Clean up object URLs
    images.forEach(img => URL.revokeObjectURL(img.element.src));
    images = [];
    currentPDF = null;
    updateImageList();
    updateButtonStates();
    outputContainer.innerHTML = '';
});

// Reorder images
reorderImages.addEventListener('click', () => {
    const imageItems = Array.from(imageList.children);
    imageItems.forEach((item, index) => {
        item.style.cursor = 'move';
        item.draggable = true;
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            item.style.borderTop = e.clientY < midY ? '2px solid #007bff' : 'none';
            item.style.borderBottom = e.clientY >= midY ? '2px solid #007bff' : 'none';
        });
        item.addEventListener('dragleave', () => {
            item.style.borderTop = 'none';
            item.style.borderBottom = 'none';
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderTop = 'none';
            item.style.borderBottom = 'none';
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            if (fromIndex !== toIndex) {
                const image = images.splice(fromIndex, 1)[0];
                images.splice(toIndex, 0, image);
                updateImageList();
            }
        });
    });
});

// Update preview when settings change
[pageSize, pageOrientation, imageQuality, imageFit].forEach(element => {
    element.addEventListener('change', () => {
        if (currentPDF !== null) {
            convertToPDF.click();
        }
    });
}); 
// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const videoUpload = document.getElementById('videoUpload');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('previewContainer');
const frameList = document.getElementById('frameList');
const frameRate = document.getElementById('frameRate');
const quality = document.getElementById('quality');
const loop = document.getElementById('loop');
const width = document.getElementById('width');
const height = document.getElementById('height');
const createGif = document.getElementById('createGif');
const clearFrames = document.getElementById('clearFrames');
const reorderFrames = document.getElementById('reorderFrames');
const outputContainer = document.getElementById('outputContainer');
const downloadGif = document.getElementById('downloadGif');

// State
let frames = [];
let currentGif = null;
let isProcessing = false;

// Initialize GIF.js
function initGif() {
    return new GIF({
        workers: 2,
        quality: getQualityValue(),
        width: parseInt(width.value),
        height: parseInt(height.value),
        workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });
}

// Get quality value based on selection
function getQualityValue() {
    switch (quality.value) {
        case 'high': return 20;
        case 'medium': return 10;
        case 'low': return 5;
        default: return 10;
    }
}

// Handle image upload
imageUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Clear existing frames
    frames = [];
    frameList.innerHTML = '';
    preview.innerHTML = '';

    // Process each image
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const img = await loadImage(file);
        frames.push({
            element: img,
            file: file
        });
        addFrameToList(img, frames.length - 1);
    }

    // Show first frame in preview
    if (frames.length > 0) {
        updatePreview(frames[0].element);
    }
});

// Handle video upload
videoUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    // Clear existing frames
    frames = [];
    frameList.innerHTML = '';
    preview.innerHTML = '';

    // Create video element
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    await new Promise(resolve => video.addEventListener('loadedmetadata', resolve));

    // Extract frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Calculate frame interval based on video duration and desired frame rate
    const frameInterval = 1000 / parseInt(frameRate.value);
    const duration = video.duration * 1000;
    const numFrames = Math.floor(duration / frameInterval);

    for (let i = 0; i < numFrames; i++) {
        video.currentTime = (i * frameInterval) / 1000;
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.src = canvas.toDataURL('image/png');
        await new Promise(resolve => img.onload = resolve);

        frames.push({
            element: img,
            time: i * frameInterval
        });
        addFrameToList(img, frames.length - 1);
    }

    // Show first frame in preview
    if (frames.length > 0) {
        updatePreview(frames[0].element);
    }

    // Cleanup
    URL.revokeObjectURL(video.src);
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

// Add frame to the list
function addFrameToList(img, index) {
    const frameItem = document.createElement('div');
    frameItem.className = 'frame-item d-flex align-items-center mb-2 p-2 border rounded';
    frameItem.innerHTML = `
        <img src="${img.src}" class="me-2" style="width: 50px; height: 50px; object-fit: cover;">
        <span>Frame ${index + 1}</span>
        <button class="btn btn-sm btn-danger ms-auto" onclick="removeFrame(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    frameList.appendChild(frameItem);
}

// Remove frame
function removeFrame(index) {
    frames.splice(index, 1);
    updateFrameList();
    if (frames.length > 0) {
        updatePreview(frames[0].element);
    } else {
        preview.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i><p class="mt-2">Preview will appear here</p>';
    }
}

// Update frame list
function updateFrameList() {
    frameList.innerHTML = '';
    frames.forEach((frame, index) => {
        addFrameToList(frame.element, index);
    });
}

// Update preview
function updatePreview(img) {
    preview.innerHTML = '';
    const previewImg = document.createElement('img');
    previewImg.src = img.src;
    previewImg.style.maxWidth = '100%';
    previewImg.style.maxHeight = '300px';
    preview.appendChild(previewImg);
}

// Create GIF
createGif.addEventListener('click', async () => {
    if (frames.length === 0 || isProcessing) return;

    isProcessing = true;
    createGif.disabled = true;
    outputContainer.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';

    try {
        // Initialize GIF
        currentGif = initGif();

        // Add frames
        frames.forEach(frame => {
            currentGif.addFrame(frame.element);
        });

        // Set options
        currentGif.options.fps = parseInt(frameRate.value);
        currentGif.options.loop = loop.value === 'infinite' ? 0 : 
                                 loop.value === 'once' ? 1 : 
                                 parseInt(loop.value);

        // Render GIF
        currentGif.on('progress', (p) => {
            outputContainer.innerHTML = `
                <div class="progress mb-3">
                    <div class="progress-bar" role="progressbar" style="width: ${p * 100}%">
                        ${Math.round(p * 100)}%
                    </div>
                </div>
            `;
        });

        currentGif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            outputContainer.innerHTML = `
                <img src="${url}" class="img-fluid mb-3" style="max-height: 300px;">
                <div class="alert alert-success">GIF created successfully!</div>
            `;
            downloadGif.disabled = false;
            downloadGif.onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = 'animated.gif';
                a.click();
            };
        });

        currentGif.render();
    } catch (error) {
        outputContainer.innerHTML = `
            <div class="alert alert-danger">
                Error creating GIF: ${error.message}
            </div>
        `;
    } finally {
        isProcessing = false;
        createGif.disabled = false;
    }
});

// Clear frames
clearFrames.addEventListener('click', () => {
    frames = [];
    frameList.innerHTML = '';
    preview.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i><p class="mt-2">Preview will appear here</p>';
    outputContainer.innerHTML = '';
    downloadGif.disabled = true;
});

// Reorder frames
reorderFrames.addEventListener('click', () => {
    const frameItems = Array.from(frameList.children);
    frameItems.forEach((item, index) => {
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
                const frame = frames.splice(fromIndex, 1)[0];
                frames.splice(toIndex, 0, frame);
                updateFrameList();
            }
        });
    });
});

// Update preview when settings change
[frameRate, quality, loop, width, height].forEach(element => {
    element.addEventListener('change', () => {
        if (frames.length > 0) {
            updatePreview(frames[0].element);
        }
    });
}); 
// DOM Elements
const url = document.getElementById('url');
const priority = document.getElementById('priority');
const frequency = document.getElementById('frequency');
const addUrl = document.getElementById('addUrl');
const urlList = document.getElementById('urlList');
const generateSitemap = document.getElementById('generateSitemap');
const clearUrls = document.getElementById('clearUrls');
const sitemapOutput = document.getElementById('sitemapOutput');
const downloadSitemap = document.getElementById('downloadSitemap');

// Store URLs
let urls = [];

// Add URL
addUrl.addEventListener('click', () => {
    const urlValue = url.value.trim();
    if (!urlValue) {
        showToast('Please enter a URL', 'error');
        return;
    }

    // Validate URL format
    try {
        new URL(urlValue);
    } catch (e) {
        showToast('Please enter a valid URL', 'error');
        return;
    }

    // Add URL to the list
    urls.push({
        url: urlValue,
        priority: priority.value,
        frequency: frequency.value,
        lastmod: new Date().toISOString().split('T')[0]
    });

    // Update URL list display
    updateUrlList();

    // Clear input
    url.value = '';
});

// Remove URL
function removeUrl(index) {
    urls.splice(index, 1);
    updateUrlList();
}

// Update URL list display
function updateUrlList() {
    if (urls.length === 0) {
        urlList.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-list fa-2x mb-2"></i>
                <p>No URLs added yet. Add URLs to generate your sitemap.</p>
            </div>
        `;
        return;
    }

    urlList.innerHTML = urls.map((item, index) => `
        <div class="url-item" draggable="true" data-index="${index}">
            <i class="fas fa-grip-vertical drag-handle"></i>
            <span class="url-text">${item.url}</span>
            <span class="badge bg-secondary me-2">${item.priority}</span>
            <span class="badge bg-info me-2">${item.frequency}</span>
            <i class="fas fa-times remove-url" onclick="removeUrl(${index})"></i>
        </div>
    `).join('');

    // Initialize drag and drop
    initializeDragAndDrop();
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    const items = urlList.querySelectorAll('.url-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            e.dataTransfer.setData('text/plain', item.dataset.index);
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem && draggingItem !== item) {
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    item.classList.add('drag-over');
                } else {
                    item.classList.remove('drag-over');
                }
            }
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(item.dataset.index);
            
            if (fromIndex !== toIndex) {
                const url = urls[fromIndex];
                urls.splice(fromIndex, 1);
                urls.splice(toIndex, 0, url);
                updateUrlList();
            }
        });
    });
}

// Generate sitemap XML
generateSitemap.addEventListener('click', () => {
    if (urls.length === 0) {
        showToast('Please add at least one URL', 'error');
        return;
    }

    // Generate XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    urls.forEach(item => {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(item.url)}</loc>\n`;
        xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
        if (item.priority !== '0.5') {
            xml += `    <priority>${item.priority}</priority>\n`;
        }
        if (item.frequency !== 'daily') {
            xml += `    <changefreq>${item.frequency}</changefreq>\n`;
        }
        xml += '  </url>\n';
    });
    
    xml += '</urlset>';

    // Update output
    sitemapOutput.textContent = xml;
    Prism.highlightElement(sitemapOutput);

    // Enable download button
    downloadSitemap.disabled = false;
});

// Download sitemap
downloadSitemap.addEventListener('click', () => {
    const content = sitemapOutput.textContent;
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Clear all URLs
clearUrls.addEventListener('click', () => {
    urls = [];
    updateUrlList();
    sitemapOutput.textContent = '';
    downloadSitemap.disabled = true;
});

// Escape XML special characters
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}

// Initialize
updateUrlList(); 
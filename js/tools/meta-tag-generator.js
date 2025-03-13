// DOM Elements
const pageTitle = document.getElementById('pageTitle');
const websiteUrl = document.getElementById('websiteUrl');
const metaDescription = document.getElementById('metaDescription');
const keywords = document.getElementById('keywords');
const ogTitle = document.getElementById('ogTitle');
const ogType = document.getElementById('ogType');
const ogDescription = document.getElementById('ogDescription');
const ogImage = document.getElementById('ogImage');
const twitterCard = document.getElementById('twitterCard');
const twitterSite = document.getElementById('twitterSite');
const twitterTitle = document.getElementById('twitterTitle');
const twitterDescription = document.getElementById('twitterDescription');
const twitterImage = document.getElementById('twitterImage');
const author = document.getElementById('author');
const language = document.getElementById('language');
const robots = document.getElementById('robots');
const canonicalUrl = document.getElementById('canonicalUrl');
const generateTags = document.getElementById('generateTags');
const clearForm = document.getElementById('clearForm');
const copyCode = document.getElementById('copyCode');
const outputCode = document.getElementById('outputCode');
const previewTitle = document.getElementById('previewTitle');
const previewUrl = document.getElementById('previewUrl');
const previewDescription = document.getElementById('previewDescription');

// Auto-fill OG and Twitter fields when basic info changes
pageTitle.addEventListener('input', () => {
    if (!ogTitle.value) ogTitle.value = pageTitle.value;
    if (!twitterTitle.value) twitterTitle.value = pageTitle.value;
});

metaDescription.addEventListener('input', () => {
    if (!ogDescription.value) ogDescription.value = metaDescription.value;
    if (!twitterDescription.value) twitterDescription.value = metaDescription.value;
});

// Generate meta tags
generateTags.addEventListener('click', () => {
    const metaTags = [];

    // Basic meta tags
    if (pageTitle.value) {
        metaTags.push(`<title>${escapeHtml(pageTitle.value)}</title>`);
    }
    if (metaDescription.value) {
        metaTags.push(`<meta name="description" content="${escapeHtml(metaDescription.value)}">`);
    }
    if (keywords.value) {
        metaTags.push(`<meta name="keywords" content="${escapeHtml(keywords.value)}">`);
    }

    // Open Graph tags
    if (ogTitle.value) {
        metaTags.push(`<meta property="og:title" content="${escapeHtml(ogTitle.value)}">`);
    }
    if (ogType.value) {
        metaTags.push(`<meta property="og:type" content="${escapeHtml(ogType.value)}">`);
    }
    if (ogDescription.value) {
        metaTags.push(`<meta property="og:description" content="${escapeHtml(ogDescription.value)}">`);
    }
    if (ogImage.value) {
        metaTags.push(`<meta property="og:image" content="${escapeHtml(ogImage.value)}">`);
    }
    if (websiteUrl.value) {
        metaTags.push(`<meta property="og:url" content="${escapeHtml(websiteUrl.value)}">`);
    }

    // Twitter Card tags
    if (twitterCard.value) {
        metaTags.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard.value)}">`);
    }
    if (twitterSite.value) {
        metaTags.push(`<meta name="twitter:site" content="${escapeHtml(twitterSite.value)}">`);
    }
    if (twitterTitle.value) {
        metaTags.push(`<meta name="twitter:title" content="${escapeHtml(twitterTitle.value)}">`);
    }
    if (twitterDescription.value) {
        metaTags.push(`<meta name="twitter:description" content="${escapeHtml(twitterDescription.value)}">`);
    }
    if (twitterImage.value) {
        metaTags.push(`<meta name="twitter:image" content="${escapeHtml(twitterImage.value)}">`);
    }

    // Additional meta tags
    if (author.value) {
        metaTags.push(`<meta name="author" content="${escapeHtml(author.value)}">`);
    }
    if (language.value) {
        metaTags.push(`<meta name="language" content="${escapeHtml(language.value)}">`);
    }
    if (robots.value) {
        metaTags.push(`<meta name="robots" content="${escapeHtml(robots.value)}">`);
    }
    if (canonicalUrl.value) {
        metaTags.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl.value)}">`);
    }

    // Generate HTML output
    const htmlOutput = metaTags.join('\n');
    outputCode.textContent = htmlOutput;
    Prism.highlightElement(outputCode);

    // Update preview
    updatePreview();
});

// Clear form
clearForm.addEventListener('click', () => {
    // Reset all input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type === 'select-one') {
            input.selectedIndex = 0;
        } else {
            input.value = '';
        }
    });

    // Clear output and preview
    outputCode.textContent = '';
    updatePreview();
});

// Copy code to clipboard
copyCode.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(outputCode.textContent);
        showToast('Code copied to clipboard!');
    } catch (error) {
        console.error('Error copying code:', error);
        showToast('Error copying code to clipboard', 'error');
    }
});

// Update search engine preview
function updatePreview() {
    // Update title
    previewTitle.textContent = pageTitle.value || 'Page Title';
    previewTitle.style.color = pageTitle.value ? '#1a0dab' : '#999';

    // Update URL
    previewUrl.textContent = websiteUrl.value || 'example.com';
    previewUrl.style.color = websiteUrl.value ? '#006621' : '#999';

    // Update description
    previewDescription.textContent = metaDescription.value || 'A description of the page content...';
    previewDescription.style.color = metaDescription.value ? '#545454' : '#999';
}

// Escape HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Character counter for title and description
function updateCharacterCount(input, maxLength) {
    const count = input.value.length;
    const counter = input.nextElementSibling;
    if (counter && counter.classList.contains('form-text')) {
        counter.textContent = `Characters: ${count}/${maxLength}`;
        counter.style.color = count > maxLength ? '#dc3545' : '#6c757d';
    }
}

// Add character counters
pageTitle.addEventListener('input', () => updateCharacterCount(pageTitle, 60));
metaDescription.addEventListener('input', () => updateCharacterCount(metaDescription, 160));

// Initialize preview
updatePreview(); 
// Tool Categories and Data
const toolCategories = {
    'image-tools': {
        name: 'Image Tools',
        icon: 'fas fa-image',
        tools: [
            { id: 'image-to-png', name: 'Image to PNG Converter', description: 'Convert images to PNG format' },
            { id: 'image-to-jpg', name: 'Image to JPG Converter', description: 'Convert images to JPG format' },
            { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images while maintaining aspect ratio' },
            // Add more image tools...
        ]
    },
    'seo-tools': {
        name: 'SEO Tools',
        icon: 'fas fa-search',
        tools: [
            { id: 'meta-tag-generator', name: 'Meta Tag Generator', description: 'Generate SEO-friendly meta tags' },
            { id: 'keyword-density', name: 'Keyword Density Checker', description: 'Check keyword density in your text' },
            // Add more SEO tools...
        ]
    },
    // Add more categories...
};

// Load Header and Footer
async function loadComponents() {
    try {
        const headerResponse = await fetch('/components/header.html');
        const footerResponse = await fetch('/components/footer.html');
        
        const headerHtml = await headerResponse.text();
        const footerHtml = await footerResponse.text();
        
        document.getElementById('header-container').innerHTML = headerHtml;
        document.getElementById('footer-container').innerHTML = footerHtml;
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-text').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }, 300));
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Tool Card Generator
function generateToolCards() {
    const toolsContainer = document.getElementById('tools-container');
    if (!toolsContainer) return;

    Object.entries(toolCategories).forEach(([categoryId, category]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section mb-4';
        
        categorySection.innerHTML = `
            <h2 class="category-title mb-3">
                <i class="${category.icon}"></i> ${category.name}
            </h2>
            <div class="row">
                ${category.tools.map(tool => `
                    <div class="col-md-4 mb-4">
                        <div class="card tool-card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${tool.name}</h5>
                                <p class="card-text">${tool.description}</p>
                                <a href="/tools/${tool.id}" class="btn btn-primary">Use Tool</a>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        toolsContainer.appendChild(categorySection);
    });
}

// Initialize Tool Page
function initializeToolPage() {
    const toolContainer = document.querySelector('.tool-container');
    if (!toolContainer) return;

    // Get tool ID from URL
    const toolId = window.location.pathname.split('/').pop();
    
    // Load tool-specific JavaScript
    const script = document.createElement('script');
    script.src = `/js/tools/${toolId}.js`;
    document.body.appendChild(script);
}

// Ad Management
function initializeAds() {
    // Initialize Google AdSense or other ad providers
    // This is a placeholder for ad initialization
    const adSpaces = document.querySelectorAll('.ad-space');
    adSpaces.forEach(space => {
        // Add ad initialization code here
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    initializeSearch();
    generateToolCards();
    initializeToolPage();
    initializeAds();
}); 
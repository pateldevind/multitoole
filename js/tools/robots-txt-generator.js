// DOM Elements
const userAgent = document.getElementById('userAgent');
const customUserAgent = document.getElementById('customUserAgent');
const action = document.getElementById('action');
const path = document.getElementById('path');
const addRule = document.getElementById('addRule');
const ruleList = document.getElementById('ruleList');
const sitemapUrl = document.getElementById('sitemapUrl');
const crawlDelay = document.getElementById('crawlDelay');
const generateRobots = document.getElementById('generateRobots');
const clearRules = document.getElementById('clearRules');
const robotsOutput = document.getElementById('robotsOutput');
const downloadRobots = document.getElementById('downloadRobots');

// Store rules
let rules = [];

// Show/hide custom user agent input
userAgent.addEventListener('change', () => {
    customUserAgent.style.display = userAgent.value === 'custom' ? 'block' : 'none';
});

// Add rule
addRule.addEventListener('click', () => {
    const pathValue = path.value.trim();
    if (!pathValue) {
        showToast('Please enter a path', 'error');
        return;
    }

    // Get user agent value
    let userAgentValue = userAgent.value;
    if (userAgentValue === 'custom') {
        userAgentValue = customUserAgent.value.trim();
        if (!userAgentValue) {
            showToast('Please enter a custom user agent', 'error');
            return;
        }
    }

    // Add rule to the list
    rules.push({
        userAgent: userAgentValue,
        action: action.value,
        path: pathValue
    });

    // Update rule list display
    updateRuleList();

    // Clear inputs
    path.value = '';
    if (userAgent.value === 'custom') {
        customUserAgent.value = '';
        userAgent.value = '*';
        customUserAgent.style.display = 'none';
    }
});

// Remove rule
function removeRule(index) {
    rules.splice(index, 1);
    updateRuleList();
}

// Update rule list display
function updateRuleList() {
    if (rules.length === 0) {
        ruleList.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-list fa-2x mb-2"></i>
                <p>No rules added yet. Add rules to generate your robots.txt file.</p>
            </div>
        `;
        return;
    }

    ruleList.innerHTML = rules.map((rule, index) => `
        <div class="rule-item" draggable="true" data-index="${index}">
            <i class="fas fa-grip-vertical drag-handle"></i>
            <span class="rule-text">${rule.userAgent} - ${rule.action} ${rule.path}</span>
            <i class="fas fa-times remove-rule" onclick="removeRule(${index})"></i>
        </div>
    `).join('');

    // Initialize drag and drop
    initializeDragAndDrop();
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    const items = ruleList.querySelectorAll('.rule-item');
    
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
                const rule = rules[fromIndex];
                rules.splice(fromIndex, 1);
                rules.splice(toIndex, 0, rule);
                updateRuleList();
            }
        });
    });
}

// Generate robots.txt content
generateRobots.addEventListener('click', () => {
    if (rules.length === 0) {
        showToast('Please add at least one rule', 'error');
        return;
    }

    // Group rules by user agent
    const groupedRules = {};
    rules.forEach(rule => {
        if (!groupedRules[rule.userAgent]) {
            groupedRules[rule.userAgent] = [];
        }
        groupedRules[rule.userAgent].push(rule);
    });

    // Generate robots.txt content
    let content = '';
    
    // Add sitemap if provided
    if (sitemapUrl.value.trim()) {
        content += `Sitemap: ${sitemapUrl.value.trim()}\n\n`;
    }

    // Add crawl delay if provided
    if (crawlDelay.value.trim()) {
        content += `Crawl-delay: ${crawlDelay.value.trim()}\n\n`;
    }

    // Add rules for each user agent
    Object.entries(groupedRules).forEach(([userAgent, userRules]) => {
        content += `User-agent: ${userAgent}\n`;
        userRules.forEach(rule => {
            content += `${rule.action}: ${rule.path}\n`;
        });
        content += '\n';
    });

    // Update output
    robotsOutput.textContent = content;
    Prism.highlightElement(robotsOutput);

    // Enable download button
    downloadRobots.disabled = false;
});

// Download robots.txt
downloadRobots.addEventListener('click', () => {
    const content = robotsOutput.textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Clear all rules
clearRules.addEventListener('click', () => {
    rules = [];
    updateRuleList();
    robotsOutput.textContent = '';
    downloadRobots.disabled = true;
    sitemapUrl.value = '';
    crawlDelay.value = '';
});

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
updateRuleList(); 
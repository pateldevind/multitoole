// DOM Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const clearInput = document.getElementById('clearInput');
const clearOutput = document.getElementById('clearOutput');
const copyInput = document.getElementById('copyInput');
const copyOutput = document.getElementById('copyOutput');
const caseButtons = document.querySelectorAll('.case-button');

// Case conversion functions
const caseConverters = {
    uppercase: (text) => text.toUpperCase(),
    lowercase: (text) => text.toLowerCase(),
    title: (text) => {
        return text.split(' ').map(word => {
            if (word.length === 0) return word;
            return word[0].toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    },
    sentence: (text) => {
        return text.split('. ').map(sentence => {
            if (sentence.length === 0) return sentence;
            return sentence[0].toUpperCase() + sentence.slice(1).toLowerCase();
        }).join('. ');
    },
    alternating: (text) => {
        return text.split('').map((char, index) => {
            if (char.match(/[a-zA-Z]/)) {
                return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
            }
            return char;
        }).join('');
    },
    inverse: (text) => {
        return text.split('').map(char => {
            if (char.match(/[a-zA-Z]/)) {
                return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
            }
            return char;
        }).join('');
    }
};

// Convert text based on selected case
function convertText(caseType) {
    const text = inputText.value;
    if (!text) return;
    
    outputText.value = caseConverters[caseType](text);
}

// Handle case button clicks
caseButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        caseButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        // Convert text
        convertText(button.dataset.case);
    });
});

// Clear input
clearInput.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    caseButtons.forEach(btn => btn.classList.remove('active'));
});

// Clear output
clearOutput.addEventListener('click', () => {
    outputText.value = '';
});

// Copy input text
copyInput.addEventListener('click', () => {
    inputText.select();
    document.execCommand('copy');
    showToast('Input text copied to clipboard!');
});

// Copy output text
copyOutput.addEventListener('click', () => {
    outputText.select();
    document.execCommand('copy');
    showToast('Output text copied to clipboard!');
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
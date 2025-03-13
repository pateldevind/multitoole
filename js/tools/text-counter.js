// DOM Elements
const textInput = document.getElementById('textInput');
const clearText = document.getElementById('clearText');
const copyText = document.getElementById('copyText');
const charCount = document.getElementById('charCount');
const charNoSpaceCount = document.getElementById('charNoSpaceCount');
const wordCount = document.getElementById('wordCount');
const sentenceCount = document.getElementById('sentenceCount');
const readingTime = document.getElementById('readingTime');
const avgWordLength = document.getElementById('avgWordLength');
const avgSentenceLength = document.getElementById('avgSentenceLength');
const wordList = document.getElementById('wordList');

// Common words to ignore in frequency analysis
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
]);

// Update statistics
function updateStats() {
    const text = textInput.value;
    
    // Character counts
    const totalChars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    
    // Word count and analysis
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCountValue = words.length;
    
    // Sentence count
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCountValue = sentences.length;
    
    // Reading time (assuming 200 words per minute)
    const readingTimeValue = Math.ceil(wordCountValue / 200);
    
    // Average word length
    const avgWordLengthValue = wordCountValue > 0 
        ? (charsNoSpace / wordCountValue).toFixed(1)
        : 0;
    
    // Average sentence length
    const avgSentenceLengthValue = sentenceCountValue > 0
        ? (wordCountValue / sentenceCountValue).toFixed(1)
        : 0;
    
    // Update display
    charCount.textContent = totalChars;
    charNoSpaceCount.textContent = charsNoSpace;
    wordCount.textContent = wordCountValue;
    sentenceCount.textContent = sentenceCountValue;
    readingTime.textContent = readingTimeValue;
    avgWordLength.textContent = avgWordLengthValue;
    avgSentenceLength.textContent = avgSentenceLengthValue;
    
    // Update word frequency
    updateWordFrequency(words);
}

// Update word frequency list
function updateWordFrequency(words) {
    if (words.length === 0) {
        wordList.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-chart-bar fa-2x mb-2"></i>
                <p>Word frequency will appear here when you enter text.</p>
            </div>
        `;
        return;
    }
    
    // Count word frequency
    const frequency = {};
    words.forEach(word => {
        word = word.toLowerCase();
        if (!commonWords.has(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20); // Show top 20 words
    
    // Update display
    wordList.innerHTML = sortedWords.map(([word, count]) => `
        <div class="word-item">
            <span>${word}</span>
            <span class="badge bg-primary">${count}</span>
        </div>
    `).join('');
}

// Clear text
clearText.addEventListener('click', () => {
    textInput.value = '';
    updateStats();
});

// Copy text
copyText.addEventListener('click', () => {
    textInput.select();
    document.execCommand('copy');
    showToast('Text copied to clipboard!');
});

// Update stats on input
textInput.addEventListener('input', updateStats);

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
updateStats(); 
// DOM Elements
const inputText = document.getElementById('inputText');
const clearText = document.getElementById('clearText');
const checkPlagiarism = document.getElementById('checkPlagiarism');
const analysisResults = document.getElementById('analysisResults');
const similarityScore = document.getElementById('similarityScore');
const wordCount = document.getElementById('wordCount');
const uniqueWords = document.getElementById('uniqueWords');
const readingTime = document.getElementById('readingTime');
const similarityBar = document.getElementById('similarityBar');
const similarityLevel = document.getElementById('similarityLevel');
const commonPhrases = document.getElementById('commonPhrases');

// Common phrases to check for
const commonPhrasesList = [
    'in conclusion',
    'it is important to note',
    'as a result',
    'in addition',
    'furthermore',
    'moreover',
    'consequently',
    'therefore',
    'thus',
    'hence',
    'for example',
    'for instance',
    'specifically',
    'in particular',
    'in other words',
    'to put it another way',
    'in summary',
    'to summarize',
    'in brief',
    'in short'
];

// Common words to ignore in analysis
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take'
]);

// Analyze text for plagiarism
function analyzeText() {
    const text = inputText.value;
    if (!text) {
        showToast('Please enter some text to analyze.', 'warning');
        return;
    }

    // Basic text statistics
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const uniqueWordsSet = new Set(words.map(word => word.toLowerCase()));
    const totalWords = words.length;
    const uniqueWordsCount = uniqueWordsSet.size;
    const readingTimeValue = Math.ceil(totalWords / 200); // Assuming 200 words per minute

    // Update statistics
    wordCount.textContent = totalWords;
    uniqueWords.textContent = uniqueWordsCount;
    readingTime.textContent = readingTimeValue;

    // Calculate similarity score (simulated)
    const similarity = calculateSimilarity(text);
    const similarityPercentage = Math.round(similarity * 100);

    // Update similarity score and bar
    similarityScore.textContent = `${similarityPercentage}%`;
    similarityBar.style.width = `${similarityPercentage}%`;
    
    // Update similarity bar color based on percentage
    similarityBar.className = 'similarity-fill';
    if (similarityPercentage >= 70) {
        similarityBar.classList.add('danger');
        similarityLevel.textContent = 'High Similarity';
    } else if (similarityPercentage >= 40) {
        similarityBar.classList.add('warning');
        similarityLevel.textContent = 'Moderate Similarity';
    } else {
        similarityBar.classList.add('success');
        similarityLevel.textContent = 'Low Similarity';
    }

    // Find common phrases
    const foundPhrases = findCommonPhrases(text);
    updateCommonPhrases(foundPhrases);

    // Generate analysis report
    generateAnalysisReport(text, similarityPercentage, foundPhrases);
}

// Calculate similarity score (simulated)
function calculateSimilarity(text) {
    // This is a simplified simulation
    // In a real implementation, you would compare against a database of existing content
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const commonWordsCount = words.filter(word => commonWords.has(word)).length;
    
    // Simple formula: (unique words / total words) * (1 - common words ratio)
    const uniqueRatio = uniqueWords.size / words.length;
    const commonRatio = commonWordsCount / words.length;
    
    return uniqueRatio * (1 - commonRatio);
}

// Find common phrases in text
function findCommonPhrases(text) {
    const lowerText = text.toLowerCase();
    return commonPhrasesList.filter(phrase => 
        lowerText.includes(phrase)
    );
}

// Update common phrases display
function updateCommonPhrases(phrases) {
    if (phrases.length === 0) {
        commonPhrases.textContent = 'No common phrases detected';
        return;
    }

    commonPhrases.innerHTML = phrases.map(phrase => 
        `<div class="mb-1">• ${phrase}</div>`
    ).join('');
}

// Generate analysis report
function generateAnalysisReport(text, similarity, phrases) {
    const words = text.split(/\s+/);
    const highlightedText = words.map(word => {
        const lowerWord = word.toLowerCase();
        if (commonWords.has(lowerWord)) {
            return `<span class="highlight">${word}</span>`;
        }
        return `<span class="highlight unique">${word}</span>`;
    }).join(' ');

    analysisResults.innerHTML = `
        <div class="mb-4">
            <h6>Text Analysis</h6>
            <p class="mb-2">Similarity Score: ${similarity}%</p>
            <p class="mb-2">Common Phrases Found: ${phrases.length}</p>
            <p class="mb-2">Unique Words: ${uniqueWords.textContent}</p>
        </div>
        <div>
            <h6>Highlighted Text</h6>
            <div class="p-3 bg-light rounded">
                ${highlightedText}
            </div>
        </div>
    `;
}

// Clear text
clearText.addEventListener('click', () => {
    inputText.value = '';
    analysisResults.innerHTML = `
        <div class="text-center text-muted py-4">
            <i class="fas fa-chart-bar fa-2x mb-2"></i>
            <p>Analysis results will appear here when you check your text.</p>
        </div>
    `;
    similarityScore.textContent = '0%';
    wordCount.textContent = '0';
    uniqueWords.textContent = '0';
    readingTime.textContent = '0';
    similarityBar.style.width = '0%';
    similarityBar.className = 'similarity-fill';
    similarityLevel.textContent = 'Not Checked';
    commonPhrases.textContent = 'No common phrases detected';
});

// Check plagiarism
checkPlagiarism.addEventListener('click', analyzeText);

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
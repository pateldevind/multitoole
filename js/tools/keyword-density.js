// DOM Elements
const content = document.getElementById('content');
const targetKeywords = document.getElementById('targetKeywords');
const minWordLength = document.getElementById('minWordLength');
const ignoreCommonWords = document.getElementById('ignoreCommonWords');
const analyzeContent = document.getElementById('analyzeContent');
const clearContent = document.getElementById('clearContent');
const totalWords = document.getElementById('totalWords');
const uniqueWords = document.getElementById('uniqueWords');
const totalSentences = document.getElementById('totalSentences');
const readingTime = document.getElementById('readingTime');
const keywordTable = document.getElementById('keywordTable').getElementsByTagName('tbody')[0];
const wordFrequencyTable = document.getElementById('wordFrequencyTable').getElementsByTagName('tbody')[0];
const recommendations = document.getElementById('recommendations');

// Common words to ignore (if enabled)
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

// Analyze content
analyzeContent.addEventListener('click', () => {
    const text = content.value.trim();
    if (!text) {
        showToast('Please enter some content to analyze', 'error');
        return;
    }

    // Get analysis settings
    const minLength = parseInt(minWordLength.value);
    const ignoreCommon = ignoreCommonWords.value === 'true';
    const targetKeywordsList = targetKeywords.value
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

    // Analyze content
    const analysis = analyzeText(text, minLength, ignoreCommon, targetKeywordsList);
    
    // Update statistics
    updateStatistics(analysis);
    
    // Update keyword analysis
    updateKeywordAnalysis(analysis);
    
    // Update word frequency
    updateWordFrequency(analysis);
    
    // Generate recommendations
    generateRecommendations(analysis);
});

// Clear content
clearContent.addEventListener('click', () => {
    content.value = '';
    targetKeywords.value = '';
    minWordLength.value = '3';
    ignoreCommonWords.value = 'true';
    
    // Reset results
    resetResults();
});

// Analyze text content
function analyzeText(text, minLength, ignoreCommon, targetKeywords) {
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Split into words and clean
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => {
            if (word.length < minLength) return false;
            if (ignoreCommon && commonWords.has(word)) return false;
            return true;
        });

    // Count word frequencies
    const wordFreq = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Calculate keyword densities
    const keywordAnalysis = {};
    targetKeywords.forEach(keyword => {
        const count = wordFreq[keyword] || 0;
        const density = (count / words.length) * 100;
        keywordAnalysis[keyword] = {
            count,
            density,
            status: getKeywordStatus(density)
        };
    });

    // Get top 20 most frequent words
    const topWords = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([word, count]) => ({
            word,
            count,
            density: (count / words.length) * 100
        }));

    return {
        totalWords: words.length,
        uniqueWords: Object.keys(wordFreq).length,
        totalSentences: sentences.length,
        readingTime: Math.ceil(words.length / 200), // Assuming 200 words per minute
        keywordAnalysis,
        topWords,
        wordFreq
    };
}

// Get keyword status based on density
function getKeywordStatus(density) {
    if (density < 0.5) return 'Too Low';
    if (density > 3) return 'Too High';
    return 'Optimal';
}

// Update statistics display
function updateStatistics(analysis) {
    totalWords.textContent = analysis.totalWords;
    uniqueWords.textContent = analysis.uniqueWords;
    totalSentences.textContent = analysis.totalSentences;
    readingTime.textContent = `${analysis.readingTime} min`;
}

// Update keyword analysis table
function updateKeywordAnalysis(analysis) {
    keywordTable.innerHTML = '';
    
    Object.entries(analysis.keywordAnalysis).forEach(([keyword, data]) => {
        const row = keywordTable.insertRow();
        row.innerHTML = `
            <td>${keyword}</td>
            <td>${data.count}</td>
            <td>${data.density.toFixed(2)}%</td>
            <td><span class="badge bg-${getStatusColor(data.status)}">${data.status}</span></td>
        `;
    });
}

// Update word frequency table
function updateWordFrequency(analysis) {
    wordFrequencyTable.innerHTML = '';
    
    analysis.topWords.forEach(word => {
        const row = wordFrequencyTable.insertRow();
        row.innerHTML = `
            <td>${word.word}</td>
            <td>${word.count}</td>
            <td>${word.density.toFixed(2)}%</td>
        `;
    });
}

// Generate SEO recommendations
function generateRecommendations(analysis) {
    const recommendationsList = [];

    // Content length recommendations
    if (analysis.totalWords < 300) {
        recommendationsList.push({
            type: 'warning',
            message: 'Your content is quite short. Consider adding more content to improve SEO.'
        });
    }

    // Keyword density recommendations
    Object.entries(analysis.keywordAnalysis).forEach(([keyword, data]) => {
        if (data.status === 'Too Low') {
            recommendationsList.push({
                type: 'warning',
                message: `Consider using the keyword "${keyword}" more frequently.`
            });
        } else if (data.status === 'Too High') {
            recommendationsList.push({
                type: 'warning',
                message: `The keyword "${keyword}" appears too frequently. Consider reducing its usage.`
            });
        }
    });

    // Sentence length recommendations
    const avgWordsPerSentence = analysis.totalWords / analysis.totalSentences;
    if (avgWordsPerSentence > 25) {
        recommendationsList.push({
            type: 'info',
            message: 'Your sentences are quite long. Consider breaking them into shorter sentences for better readability.'
        });
    }

    // Update recommendations display
    if (recommendationsList.length === 0) {
        recommendations.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Your content looks well-optimized!
            </div>
        `;
    } else {
        recommendations.innerHTML = recommendationsList
            .map(rec => `
                <div class="alert alert-${rec.type}">
                    <i class="fas fa-${getRecommendationIcon(rec.type)}"></i> ${rec.message}
                </div>
            `)
            .join('');
    }
}

// Get status color for badges
function getStatusColor(status) {
    switch (status) {
        case 'Too Low': return 'warning';
        case 'Too High': return 'danger';
        case 'Optimal': return 'success';
        default: return 'secondary';
    }
}

// Get icon for recommendation type
function getRecommendationIcon(type) {
    switch (type) {
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        case 'success': return 'check-circle';
        default: return 'info-circle';
    }
}

// Reset results
function resetResults() {
    totalWords.textContent = '0';
    uniqueWords.textContent = '0';
    totalSentences.textContent = '0';
    readingTime.textContent = '0 min';
    keywordTable.innerHTML = '';
    wordFrequencyTable.innerHTML = '';
    recommendations.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Enter content and analyze to get SEO recommendations.
        </div>
    `;
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
resetResults(); 
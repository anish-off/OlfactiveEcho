let sessionId = null;
let setupStartTime = null;

// Check GPU status on load
window.onload = function() {
    checkGPUStatus();
};

async function checkGPUStatus() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        const gpuBadge = document.getElementById('gpuBadge');
        
        if (data.gpu_available) {
            gpuBadge.innerHTML = `🚀 ${data.gpu_name || 'GPU Ready'}`;
            gpuBadge.style.background = 'linear-gradient(135deg, #00c851, #007e33)';
        } else {
            gpuBadge.innerHTML = '⚠️ CPU Mode';
            gpuBadge.style.background = 'linear-gradient(135deg, #ff8800, #cc6600)';
        }
    } catch (error) {
        console.error('Error checking GPU status:', error);
    }
}

function updateProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    if (percent > 0) {
        progressBar.style.display = 'block';
        progressFill.style.width = percent + '%';
    } else {
        progressBar.style.display = 'none';
    }
}

async function setupKnowledgeBase() {
    const topic = document.getElementById('topic').value.trim();
    const limit = parseInt(document.getElementById('limit').value);
    const yearFilter = document.getElementById('yearFilter').value;
    const minCitations = document.getElementById('minCitations').value;
    
    if (!topic) {
        alert('Please enter a research topic');
        return;
    }

    const setupBtn = document.getElementById('setupBtn');
    const setupStatus = document.getElementById('setupStatus');
    const papersList = document.getElementById('papersList');
    const queryBtn = document.getElementById('queryBtn');
    const questionInput = document.getElementById('question');
    const statsRow = document.getElementById('statsRow');
    const downloadSection = document.getElementById('downloadSection');

    setupBtn.disabled = true;
    queryBtn.disabled = true;
    questionInput.disabled = true;
    downloadSection.style.display = 'none';
    setupStartTime = Date.now();

    setupStatus.innerHTML = '<div class="status loading"><div class="loading-spinner"></div>🚀 GPU-accelerated setup in progress... Downloading, processing, and summarizing papers.</div>';
    papersList.innerHTML = '';
    updateProgress(10);

    try {
        const response = await fetch('/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                limit: limit,
                year_filter: yearFilter,
                min_citations: minCitations
            })
        });

        const data = await response.json();
        updateProgress(100);

        if (data.success) {
            sessionId = data.session_id;
            const setupTime = ((Date.now() - setupStartTime) / 1000).toFixed(1);
            setupStatus.innerHTML = `<div class="status success">✅ Knowledge base ready! Processed ${data.paper_count} papers with ${data.chunk_count} chunks and AI summaries in ${setupTime}s</div>`;

            // Update stats
            document.getElementById('paperCount').textContent = data.paper_count;
            document.getElementById('chunkCount').textContent = data.chunk_count;
            document.getElementById('setupTime').textContent = setupTime + 's';
            statsRow.style.display = 'flex';

            // Show download section
            downloadSection.style.display = 'block';

            // Display papers in enhanced grid with summaries
            if (data.papers && data.papers.length > 0) {
                let papersHtml = '<div class="papers-grid">';
                data.papers.forEach((paper, index) => {
                    // Create badges for paper metadata
                    let badges = '';
                    if (paper.citation_count) {
                        badges += `<span class="badge badge-citations">📊 ${paper.citation_count} citations</span>`;
                    }
                    badges += `<span class="badge badge-year">📅 ${paper.year}</span>`;

                    papersHtml += `
                        <div class="paper-card">
                            <div class="paper-title">${index + 1}. ${paper.title}</div>
                            <div class="paper-badges">${badges}</div>
                            <div class="paper-meta">👥 ${paper.authors}</div>
                            <div class="paper-abstract">${paper.abstract || 'Abstract not available'}</div>
                            <div class="paper-summary">
                                <h4>🤖 AI-Generated Summary:</h4>
                                <p>${paper.summary || 'Summary not available'}</p>
                            </div>
                        </div>
                    `;
                });
                papersHtml += '</div>';
                papersList.innerHTML = papersHtml;
            }

            queryBtn.disabled = false;
            questionInput.disabled = false;
            questionInput.focus();

            // Add some example questions
            questionInput.placeholder = "Try: 'What are the main findings?' or 'Which methods perform best?' or 'Compare the approaches'";
        } else {
            setupStatus.innerHTML = `<div class="status error">❌ Error: ${data.error}</div>`;
        }
    } catch (error) {
        setupStatus.innerHTML = `<div class="status error">❌ Error: ${error.message}</div>`;
    } finally {
        setupBtn.disabled = false;
        updateProgress(0);
    }
}

async function askQuestion() {
    const question = document.getElementById('question').value.trim();
    
    if (!question) {
        alert('Please enter a question');
        return;
    }

    if (!sessionId) {
        alert('Please setup the knowledge base first');
        return;
    }

    const queryBtn = document.getElementById('queryBtn');
    const queryStatus = document.getElementById('queryStatus');
    const answerDiv = document.getElementById('answer');
    const startTime = Date.now();

    queryBtn.disabled = true;
    queryStatus.innerHTML = '<div class="status loading"><div class="loading-spinner"></div>🧠 AI processing your question...</div>';
    answerDiv.innerHTML = '';

    try {
        const response = await fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                session_id: sessionId
            })
        });

        const data = await response.json();
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);

        if (data.success) {
            queryStatus.innerHTML = `<div class="status success">✅ Answer generated in ${responseTime}s!</div>`;
            answerDiv.innerHTML = `<div class="answer">${data.answer}</div>`;
        } else {
            queryStatus.innerHTML = `<div class="status error">❌ Error: ${data.error}</div>`;
        }
    } catch (error) {
        queryStatus.innerHTML = `<div class="status error">❌ Error: ${error.message}</div>`;
    } finally {
        queryBtn.disabled = false;
    }
}

async function downloadSummaries() {
    if (!sessionId) {
        alert('Please setup the knowledge base first');
        return;
    }

    const downloadBtn = document.getElementById('downloadSummariesBtn');
    const originalText = downloadBtn.innerHTML;
    
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<div class="loading-spinner"></div>Generating PDF...';

    try {
        const response = await fetch(`/download_summaries/${sessionId}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `research_summaries_${sessionId.substring(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            throw new Error('Failed to download summaries');
        }
    } catch (error) {
        alert('Error downloading summaries: ' + error.message);
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = originalText;
    }
}

async function downloadPapers() {
    if (!sessionId) {
        alert('Please setup the knowledge base first');
        return;
    }

    const downloadBtn = document.getElementById('downloadPapersBtn');
    const originalText = downloadBtn.innerHTML;
    
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<div class="loading-spinner"></div>Creating ZIP...';

    try {
        const response = await fetch(`/download_papers/${sessionId}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `research_papers_${sessionId.substring(0, 8)}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            throw new Error('Failed to download papers');
        }
    } catch (error) {
        alert('Error downloading papers: ' + error.message);
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = originalText;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (sessionId) {
        // Send cleanup request (fire and forget)
        fetch(`/cleanup/${sessionId}`, { method: 'GET' }).catch(() => {});
    }
});

// Allow Enter key to submit question (Ctrl+Enter for new line)
document.getElementById('question').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        if (!this.disabled && !document.getElementById('queryBtn').disabled) {
            askQuestion();
        }
    }
});

// Auto-resize textarea
document.getElementById('question').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});
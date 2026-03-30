// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let selectedFile = null;
let currentData = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const resultsSection = document.getElementById('resultsSection');
const metadataGrid = document.getElementById('metadataGrid');
const extractedText = document.getElementById('extractedText');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newUploadBtn = document.getElementById('newUploadBtn');
const spinner = document.getElementById('spinner');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

uploadBtn.addEventListener('click', uploadResume);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadAsText);
newUploadBtn.addEventListener('click', resetUpload);

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
}

// File Selection Handler
function handleFileSelect(file) {
    // Validate file type
    if (file.type !== 'application/pdf') {
        showError('Invalid file type. Please upload a PDF file.');
        return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
    }

    selectedFile = file;
    fileInput.files = new DataTransfer().items.add(file).files;
    
    // Display file info
    fileName.textContent = `📄 ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileInfo.style.display = 'block';
    
    hideError();
    hideSuccess();
}

// Upload Resume
async function uploadResume() {
    if (!selectedFile) {
        showError('Please select a PDF file first');
        return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
        uploadBtn.disabled = true;
        spinner.style.display = 'inline-block';

        const response = await fetch(`${API_BASE_URL}/resume/upload`, {
            method: 'POST',
            body: formData
        });

        spinner.style.display = 'none';

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();

        if (result.success) {
            currentData = result.data;
            displayResults(result.data);
            showSuccess('Resume uploaded and processed successfully!');
            hideError();
        } else {
            throw new Error(result.message || 'Upload failed');
        }

    } catch (error) {
        showError(error.message);
        spinner.style.display = 'none';
    } finally {
        uploadBtn.disabled = false;
    }
}

// Display Results
function displayResults(data) {
    console.log('📊 Display Results:', data);
    console.log('📊 Has ATS Score?', !!data.atsScore);
    
    // Display ATS Score
    if (data.atsScore) {
        console.log('✓ Displaying ATS Score:', data.atsScore.score);
        displayATSScore(data.atsScore);
    } else {
        console.warn('⚠️ No ATS Score in response');
    }

    // Display Metadata
    metadataGrid.innerHTML = '';
    
    if (data.metadata) {
        const metadata = [
            { label: 'Pages', value: data.metadata.pages || 'N/A' },
            { label: 'File Name', value: data.fileName || 'N/A', full: true },
            ...(data.metadata.emails ? [{ label: 'Emails Found', value: data.metadata.emails?.length || 0 }] : []),
            ...(data.metadata.phones ? [{ label: 'Phones Found', value: data.metadata.phones?.length || 0 }] : []),
            ...(data.metadata.urls ? [{ label: 'URLs Found', value: data.metadata.urls?.length || 0 }] : []),
        ];

        metadata.forEach(item => {
            const div = document.createElement('div');
            div.className = 'metadata-item';
            if (item.full) {
                div.style.gridColumn = 'span 2';
            }
            div.innerHTML = `
                <div class="metadata-label">${item.label}</div>
                <div class="metadata-value">${escapeHtml(String(item.value))}</div>
            `;
            metadataGrid.appendChild(div);
        });
    }

    // Display Extracted Text
    extractedText.textContent = data.extractedText || 'No text extracted';

    // Show results section
    document.querySelector('.upload-section').style.display = 'none';
    resultsSection.style.display = 'block';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Display ATS Score
function displayATSScore(atsScore) {
    const scoreValue = document.getElementById('scoreValue');
    const scoreRating = document.getElementById('scoreRating');
    const scoreCircle = document.getElementById('scoreCircle');
    const breakdownItems = document.getElementById('breakdownItems');
    const recommendationsList = document.getElementById('recommendationsList');

    // Display main score
    scoreValue.textContent = atsScore.score;
    scoreRating.textContent = `${atsScore.ratingEmoji} ${atsScore.rating}`;

    // Color code the score circle based on rating
    if (atsScore.score >= 85) {
        scoreCircle.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.4)';
        scoreValue.style.color = '#10b981';
    } else if (atsScore.score >= 75) {
        scoreCircle.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
        scoreValue.style.color = '#3b82f6';
    } else if (atsScore.score >= 65) {
        scoreCircle.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.4)';
        scoreValue.style.color = '#f59e0b';
    } else {
        scoreCircle.style.boxShadow = '0 10px 30px rgba(239, 68, 68, 0.4)';
        scoreValue.style.color = '#ef4444';
    }

    // Display breakdown
    breakdownItems.innerHTML = '';
    Object.values(atsScore.breakdown).forEach(item => {
        const percentage = Math.round((item.score / item.max) * 100);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'breakdown-item';
        itemDiv.innerHTML = `
            <div class="breakdown-label">${item.icon} ${item.label}</div>
            <div class="breakdown-bar">
                <div class="breakdown-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="breakdown-score">${Math.round(item.score)}/${item.max}</div>
        `;
        breakdownItems.appendChild(itemDiv);
    });

    // Display recommendations with proper formatting
    recommendationsList.innerHTML = '';
    if (atsScore.recommendations && Array.isArray(atsScore.recommendations)) {
        atsScore.recommendations.forEach(rec => {
            const li = document.createElement('li');
            
            // Handle both string and object recommendations
            if (typeof rec === 'string') {
                li.textContent = rec;
            } else if (typeof rec === 'object') {
                li.innerHTML = `
                    <strong>${rec.emoji} ${rec.title}:</strong> ${rec.description}
                `;
                li.className = `recommendation-${rec.priority || 'medium'}`;
            }
            
            recommendationsList.appendChild(li);
        });
    }

    console.log('ATS Score displayed:', atsScore);
}

// Copy to Clipboard
async function copyToClipboard() {
    if (!currentData) return;

    try {
        await navigator.clipboard.writeText(currentData.extractedText);
        showSuccess('Text copied to clipboard!');
    } catch (error) {
        showError('Failed to copy text');
    }
}

// Download as Text
function downloadAsText() {
    if (!currentData) return;

    const element = document.createElement('a');
    const file = new Blob([currentData.extractedText], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = currentData.fileName.replace('.pdf', '.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showSuccess('File downloaded successfully!');
}

// Reset Upload
function resetUpload() {
    selectedFile = null;
    currentData = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    resultsSection.style.display = 'none';
    document.querySelector('.upload-section').style.display = 'block';
    hideError();
    hideSuccess();
    
    // Scroll to upload
    document.querySelector('.upload-section').scrollIntoView({ behavior: 'smooth' });
}

// Utility Functions
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    successText.textContent = message;
    successMessage.style.display = 'flex';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function hideSuccess() {
    successMessage.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
console.log('Resume Analyzer Frontend Ready');

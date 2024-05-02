document.getElementById('summarizeBtn').addEventListener('click', function() {
    document.getElementById('summary').value = ''; // Clear previous content
    const selectedLanguage = document.getElementById('languageSelect').value;
    chrome.runtime.sendMessage({command: 'summarize', language: selectedLanguage});
});

// In popup.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    const summaryElement = document.getElementById('summary');
    if (message.action === 'update') {
        summaryElement.value += message.summary; // Append new content
    } else if (message.action === 'complete') {
        summaryElement.value += '\n---End of summary---'; // Indicate completion
    }
});

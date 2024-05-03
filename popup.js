document.getElementById('summarizeBtn').addEventListener('click', async function() {
    const selectedLanguage = document.getElementById('languageSelect').value;
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => window.getSelection().toString(),
    }, async function(selection) {
        const selectedText = selection[0].result;
        if (selectedText) {
            // Summarize selected text
            chrome.runtime.sendMessage({command: 'summarizeSelectedText', text: selectedText, language: selectedLanguage});
        } else if (!tab.url.endsWith('.pdf')) {
            // Summarize whole page if no text is selected and it's not a PDF
            chrome.runtime.sendMessage({command: 'summarize', language: selectedLanguage});
        } else {
            // Handle PDF summarization
            localStorage.setItem('selectedLanguage', selectedLanguage);
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ['getContentScript.js']
            });
        }
    });
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

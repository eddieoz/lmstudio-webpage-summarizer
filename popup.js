document.getElementById('summarizeBtn').addEventListener('click', async function() {
    
    const selectedLanguage = document.getElementById('languageSelect').value;
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    chrome.tabs.get(tab.id, async function(tabInfo) {       
        
        if (!tabInfo.url.endsWith('.pdf')) {
            document.getElementById('summary').value = ''; // Clear previous content
            chrome.runtime.sendMessage({command: 'summarize', language: selectedLanguage});    
            return;
        
        } else {
            try {
                document.getElementById('summary').value = ''; // Clear previous content
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: function(selectedLanguage) {
                        localStorage.setItem('selectedLanguage', selectedLanguage); // send selectedLanguage to storage
                    },
                    args: [selectedLanguage]
                }).then(() => {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        files: ['getContentScript.js']
                    });
                });
            } catch (err) {
                console.error('Error reading PDF:', err);
            }
        }
    })
    
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

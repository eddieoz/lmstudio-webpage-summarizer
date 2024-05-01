// document.getElementById('summarizeBtn').addEventListener('click', function() {
//     chrome.runtime.sendMessage({command: 'summarizeEn'}, function(response) {
//         document.getElementById('summary').value = response;
//     });
// });

// document.getElementById('summarizeOrigBtn').addEventListener('click', function() {
//     chrome.runtime.sendMessage({command: 'summarizeOrig'}, function(response) {
//         document.getElementById('summary').value = response;
//     });
// });

document.getElementById('summarizeBtn').addEventListener('click', function() {
    document.getElementById('summary').value = ''; // Clear previous content
    chrome.runtime.sendMessage({command: 'summarizeEn'});
});

document.getElementById('summarizeOrigBtn').addEventListener('click', function() {
    document.getElementById('summary').value = ''; // Clear previous content
    chrome.runtime.sendMessage({command: 'summarizeOrig'});
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

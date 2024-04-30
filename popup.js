document.getElementById('summarizeBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: 'summarizeEn'}, function(response) {
        document.getElementById('summary').value = response;
    });
});

document.getElementById('summarizeOrigBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: 'summarizeOrig'}, function(response) {
        document.getElementById('summary').value = response;
    });
});

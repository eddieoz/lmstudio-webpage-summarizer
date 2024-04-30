document.getElementById('summarizeBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: 'summarize'}, function(response) {
        document.getElementById('summary').value = response;
    });
});

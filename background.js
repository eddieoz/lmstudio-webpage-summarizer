// Função para extrair o conteúdo da página
function extractContent() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    // Remova anúncios, menus e rodapés do conteúdo da página
                    document.querySelectorAll('header, footer, nav, .ad, .advertisement').forEach(el => el.remove());
                    return document.body.innerText;
                },
            }, (results) => {
                if (chrome.runtime.lastError || !results || results.length === 0) {
                    reject('Failed to extract content');
                } else {
                    resolve(results[0].result);
                }
            });
        });
    });
}

// Função para enviar conteúdo extraído para a API e receber o resultado
async function summarizeContent(lang) {
    try {
        const content = await extractContent();
        if (!content) throw new Error('No content to summarize');

        // let systemCommand = 'Create a summary of the original text in ' + lang + ' language, structured into 3-5 sentences that capture the main ideas and key points. The summary should be easy to understand and free from ambiguity. Summarize in ' + lang + ' language: '
        let systemCommand = 'Summarize in ' + lang + ' language: '
        const response = await fetch('http://localhost:1234/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF",
                messages: [
                    { role: "system", content: systemCommand },
                    { role: "user", content: content }
                ],
                temperature: 0.3,
                max_tokens: -1,
                stream: true
            })
        });

        let summary = '';
        const reader = response.body.getReader();
        let receivedJson = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                chrome.runtime.sendMessage({action: 'complete', summary: ''}); // Indicate completion
                return;
            }
            // if (done) break;
            receivedJson = new TextDecoder().decode(value);
            
            try {
                const result = JSON.parse(receivedJson.split('data: ')[1]);
                // Reset the receivedJson for the next chunk if JSON is successfully parsed
                receivedJson = '';
                if (result && result.choices && result.choices[0] && result.choices[0].delta && result.choices[0].delta.content) {
                    summary += result.choices[0].delta.content;
                    chrome.runtime.sendMessage({action: 'update', summary: result.choices[0].delta.content});
                }
            } catch (error) {
                // If JSON is not complete, it throws an error which is caught here.
                // No action is required as the loop continues to get more data.
            }
        }
        return summary;
    } catch (error) {
        console.error('Error summarizing content:', error);
        return 'Error summarizing content';
    }
}

// Listener para comunicação com o popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'summarize') {
        summarizeContent(message.language).then(sendResponse);
        return true; // indica que a resposta será assíncrona
    }
});

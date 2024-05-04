document
  .getElementById("summarizeBtn")
  .addEventListener("click", async function () {
    const selectedLanguage = document.getElementById("languageSelect").value;
    const summaryElement = document.getElementById("summary");
    summaryElement.innerText = "";

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      },
      async function (selection) {
        const selectedText = selection[0].result;
        if (selectedText) {
          // Summarize selected text
          chrome.runtime.sendMessage({
            command: "summarizeSelectedText",
            text: selectedText,
            language: selectedLanguage,
          });
        } else if (!tab.url.endsWith(".pdf")) {
          // Summarize whole page if no text is selected and it's not a PDF
          chrome.runtime.sendMessage({
            command: "summarize",
            language: selectedLanguage,
          });
        } else {
          chrome.scripting
            .executeScript({
              target: { tabId: tab.id },
              func: (selectedLanguage) => {
                localStorage.setItem("selectedLanguage", selectedLanguage); // Ensure it's set in the right context
                // Now, inject the script or continue other operations that depend on this setting
              },
              args: [selectedLanguage],
            })
            .then(() => {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["getContentScript.js"],
              });
            });
        }
      }
    );
  });

document
  .getElementById("explainBtn")
  .addEventListener("click", async function () {
    const selectedLanguage = document.getElementById("languageSelect").value;
    const summaryElement = document.getElementById("summary");
    summaryElement.innerText = "";

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      },
      async function (selection) {
        const selectedText = selection[0].result;
        if (selectedText) {
          chrome.runtime.sendMessage({
            command: "explainSelectedText",
            text: selectedText,
            language: selectedLanguage,
          });
        } else if (!tab.url.endsWith(".pdf")) {
          chrome.runtime.sendMessage({
            command: "explain",
            language: selectedLanguage,
          });
        } else {
          chrome.scripting
            .executeScript({
              target: { tabId: tab.id },
              func: (selectedLanguage) => {
                localStorage.setItem("selectedLanguage", selectedLanguage); // Ensure it's set in the right context
                // Now, inject the script or continue other operations that depend on this setting
              },
              args: [selectedLanguage],
            })
            .then(() => {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["getContentScript.js"],
              });
            });
        }
      }
    );
  });

// In popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const summaryElement = document.getElementById("summary");
  if (message.action === "update") {
    summaryElement.innerHTML += message.summary; // Append new content
  } else if (message.action === "complete") {
    const converter = new showdown.Converter(); // Initialize Showdown
    summaryElement.innerHTML += "<p>---End of summary---"; // Indicate completion
    summaryElement.innerHTML = converter.makeHtml(summaryElement.innerHTML);
  }
});

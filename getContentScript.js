(async () => {
  const url = location.href;
  console.log("url", url);
  const selectedLanguage = localStorage.getItem("selectedLanguage");
  console.log("language", selectedLanguage);

  if (!url.endsWith(".pdf")) {
    console.error("No PDF found at this URL.");
    return;
  }

  const workerSrc = chrome.runtime.getURL("lib/pdf.worker.mjs");
  const pdfjsLib = await import(chrome.runtime.getURL("lib/pdf.min.mjs"));
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdfDoc = await loadingTask.promise;

    // Get the current selection
    const selection = window.getSelection();
    console.log("Selected text: ", selection.toString());
    if (selection.toString()) {
      // If there's a selection, use that
      chrome.runtime.sendMessage({
        command: "sendPdfContent",
        content: selection.toString(),
        language: selectedLanguage,
      });
    } else {
      // Otherwise, extract all text from the PDF
      let fullText = "";
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      chrome.runtime.sendMessage({
        command: "sendPdfContent",
        content: fullText,
        language: selectedLanguage,
      });
    }
  } catch (err) {
    console.error("Error extracting PDF:", err);
  }
})();

// Houses common functions for both sidepanel.js and options.js

/////////////////////////
// Additional Features //
/////////////////////////

async function downloadPageNote() {
  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }
  var textToWrite = easyMDE.value();

  // preserving line breaks
  var textToWrite = textToWrite.replace(/\n/g, "\r\n");
  var textFileAsBlob = new Blob([textToWrite], { type: "text/plain" });

  // filename to save as
  var fileNameToSaveAs =
    "pn_" + titleElement.value.replace(/[\\/:*?"<>|]/g, "") + ".txt";

  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;

  // hidden link title name
  downloadLink.innerHTML = "Download";

  window.URL = window.URL || window.webkitURL;

  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);

  downloadLink.onclick = destroyClickedElement;
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}
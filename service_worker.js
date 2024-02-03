console.log("service_worker.js")
importScripts('crypto-js.min.js');
importScripts('util.js');

// Open options page on install
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install' || details.reason === 'update') {
      chrome.tabs.create({ url: 'options.html' });
    }
});

// Options the options page on keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
    if (command === "open-extension-tab") {
      chrome.runtime.openOptionsPage();
    }
  });



// Handle Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    console.log(`Command: ${command}`);

    if (command.startsWith("open-side-panel")) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            // // Check if the side panel is open and close if so
            // // Didn't work because you have about .1 seconds to
            // // open the side panel on user input

            // const tabId = tab.id
            // chrome.sidePanel.getOptions({ tabId: tab.id }, (options) => {
            //     if (options.enabled) {                    
            //         chrome.sidePanel.setOptions({
            //             tabId,
            //             enabled: false
            //           });
            //     } 
            // });
            chrome.sidePanel.open({ tabId: tab.id });
          });
    } else if (command.startsWith("copy-value")) {
        await addToClipboard(await eGet(command))
    } else if (command.startsWith("start-stop-clip-combiner")) {

    } else if (command === "open-extension-tab") {
        chrome.runtime.openOptionsPage();
    }
  });
  
  // Solution 1 - As of Jan 2023, service workers cannot directly interact with
  // the system clipboard using either `navigator.clipboard` or
  // `document.execCommand()`. To work around this, we'll create an offscreen
  // document and pass it the data we want to write to the clipboard.
  async function addToClipboard(value) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'Write text to the clipboard.'
    });
  
    // Now that we have an offscreen document, we can dispatch the
    // message.
    chrome.runtime.sendMessage({
      type: 'copy-data-to-clipboard',
      target: 'offscreen-doc',
      data: value
    });
  }
  
  // Solution 2 – Once extension service workers can use the Clipboard API,
  // replace the offscreen document based implementation with something like this.
  async function addToClipboardV2(value) {
    navigator.clipboard.writeText(value);
  } 
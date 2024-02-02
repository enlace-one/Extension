console.log("service_worker.js")
//import * as util from "./util.js"
importScripts('crypto-js.min.js');
importScripts('util.js');

// chrome.commands.onCommand.addListener(
//     copy-value-1:
//     function() {
//         window.Clipboard.copy("TEST-CPY-1")
//     },
//   )

// chrome.commands.onCommand.addListener({
// 'copy-value-1': function() {
//     window.Clipboard.copy("TEST-CPY-1");
// }
// });



// chrome.commands.onCommand.addListener(async ('copy-value-1') => {
//     console.log('test');
//     await addToClipboard("TEST");
//   });

chrome.commands.onCommand.addListener(async (command) => {
    console.log(`Command: ${command}`);

    if (command.startsWith("open-side-panel")) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            // // Check if the side panel is open
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
    }
  });



// chrome.action.onClicked.addListener(async () => {
//     await addToClipboard(textToCopy);
//   });


  
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






/////////////////
// Side Pannel //
/////////////////


// In your content script or background script:

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === 'openSidePanel') {
        const tabId = await message.tabId;

        await chrome.sidePanel.open({ tabId });
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: true
        });
    }
});


const GOOGLE_ORIGIN = 'https://www.google.com';

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    // Enables the side panel on google.com
    if (url.origin === GOOGLE_ORIGIN) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true
      });
    } else {
      // Disables the side panel on all other sites
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
    }
  });
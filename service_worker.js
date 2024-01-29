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
    await addToClipboard(await eGet(command))
    // if (command == "copy-value-1") {
    //     await addToClipboard("1");
    // } else if (command == "copy-value-2") {
    //     await addToClipboard("2");
    // } else if (command == "copy-value-3") {
    //     await addToClipboard("3");
    // } else if (command == "copy-value-4") {
    //     await addToClipboard("4");
    // }
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
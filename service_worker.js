console.log("service_worker.js")
importScripts('crypto-js.min.js');
importScripts('util.js');

// Open options page on install or update
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
        await addToClipboard(await convertSmartValues(await eGet(command)))
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


// Handle SmartValues like {{ month }}, {{ day }}, {{ date }}, {{ time }}, {{ year }}, {{ yy }}, {{ yyyy }}, {{ MM }}, {{ dd }}, {{ hh }}, {{ mm }}, {{ ss }}, {{ weekday }}
// Does not matter if there is a space or not. Ex: {{month}} or {{ month }}
async function convertSmartValues(string) {
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    var yy = year.toString().slice(2)
    var MM = month.toString().padStart(2, '0')
    var dd = day.toString().padStart(2, '0')
    var hh = hour.toString().padStart(2, '0')
    var mm = minute.toString().padStart(2, '0')
    var ss = second.toString().padStart(2, '0')

    string = string.replace(/{{\s*year\s*}}/g, year)
    string = string.replace(/{{\s*day\s*}}/g, day)
    string = string.replace(/{{\s*hour\s*}}/g, hour)
    string = string.replace(/{{\s*minute\s*}}/g, minute)
    string = string.replace(/{{\s*second\s*}}/g, second)
    string = string.replace(/{{\s*yy\s*}}/g, yy)
    string = string.replace(/{{\s*yyyy\s*}}/g, year)
    string = string.replace(/{{\s*MM\s*}}/g, MM)
    string = string.replace(/{{\s*dd\s*}}/g, dd)
    string = string.replace(/{{\s*hh\s*}}/g, hh)
    string = string.replace(/{{\s*mm\s*}}/g, mm)
    string = string.replace(/{{\s*ss\s*}}/g, ss)

    string = string.replace(/{{\s*date\s*}}/g, `${year}-${MM}-${dd}`)
    string = string.replace(/{{\s*time\s*}}/g, `${hh}:${mm}:${ss}`)

    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = days[date.getDay()];

    string = string.replace(/{{\s*weekday\s*}}/g, dayName);

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let monthName = months[date.getMonth()];

    string = string.replace(/{{\s*month\s*}}/g, monthName);

    return string

}
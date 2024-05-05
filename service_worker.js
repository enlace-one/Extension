console.log("service_worker.js")
importScripts('crypto-js.min.js');
importScripts('util.js');

let encryptPageNotes = false
getSetting("encrypt-page-notes").then((value)=> {
  encryptPageNotes = value
});

async function _save_page_note(id, note, title, url_pattern) {
  if (encryptPageNotes) {
      note = await encrypt(note)
  } 
  const noteData = {
      note: note,
      title: title,
      url_pattern: url_pattern,
      id: id
  };
  store(id, noteData)
  console.log(`Note saved with ID: ${id}`);
}

const defaultPageNotes = [
  {text:"css_selectors.txt", id:"mde_css_selectors", url_pattern:"chrome-extension:", title:"HTML/CSS Selectors"}, 
  {text:"bash.txt", id:"mde_bash", url_pattern:"", title:"Bash"}, 
  {text:"chrome_keyboard.txt", id:"mde_chrome_keyboard", url_pattern:"", title:"Chrome Keyboard Shortcuts"}, 
  {text:"git.txt", id:"mde_git", url_pattern:"", title:"git"}, 
  {text:"regex.txt", id:"mde_regex", url_pattern:"chrome-extension:", title:"Regex"}, 
  {text:"country_codes.txt", id:"mde_country_codes", url_pattern:"", title:"Country Codes"}, 
  {text:"linux_keyboard.txt", id:"mde_linux_keyboard", url_pattern:"", title:"Linux Keyboard"}, 
  {text:"linux_term.txt", id:"mde_linux_term", url_pattern:"", title:"Linux Terminal"}, 
  {text:"nmap.txt", id:"mde_nmap", url_pattern:"", title:"NMAP"}, 
  {text:"powershell.txt", id:"mde_powershell", url_pattern:"", title:"Powershell"}, 
  {text:"sql.txt", id:"mde_sql", url_pattern:"", title:"SQL"}, 
  {text:"us_states.txt", id:"mde_us_states", url_pattern:"", title:"US States"}, 
  {text:"windows_cmd.txt", id:"mde_cmd", url_pattern:"", title:"Windows CMD"}, 
  {text:"windows_keyboard.txt", id:"mde_windows_keyboard", url_pattern:"", title:"Windows Keyboard Shortcuts"}
 ]

 async function storeDefaultPageNotes() {
  for (let item of defaultPageNotes) {
    fetch("references/" + item.text)
      .then(response => response.text())
      .then(data => {
        _save_page_note(item.id, data, item.title, item.url_pattern)
      })
  }
}

// Open options page on install or update
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install' || details.reason === 'update') {
      chrome.tabs.create({ url: 'options.html' });
    }
    storeDefaultPageNotes()
});


// Options the options page on keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
    if (command === "open-extension-tab") {
      chrome.runtime.openOptionsPage();
    }
  });


async function get_clipboard_command_value(command) {
  if (await getSetting("encrypt-clipboard") === true) {
    return await convertSmartValues(await eGet(command))
  } else {
    return await convertSmartValues(await get(command))
  }
}



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
        await addToClipboard(await get_clipboard_command_value(command))

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

//////////////////
// Context Menu //
//////////////////

// chrome.runtime.onInstalled.addListener(() =>
//     chrome.contextMenus.create({
//         id: "copy-to-bin",
//         title: "Copy value to first free bin or last bin",
//         contexts: ["selection"]
//     })
// );

// // Add a listener for the context menu item
// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//     if (info.menuItemId === "copy-to-bin") {
//       chrome.commands.getAll(async function(commands) {
//         commands.forEach(async function(command) {
//             if (command.name.startsWith("copy-value")) {
//               const value = await get_clipboard_command_value(command.name)
//               if (value == null || value === "") {
//                 if (await getSetting("encrypt-clipboard")) {
//                   eStore(command.name, info.selectionText)
//                 } else {
//                   store(command.name, info.selectionText)
//                 }
//                 return true
//               }
//             }
//           });
//           if (await getSetting("encrypt-clipboard")) {
//             eStore("copy-value-5", info.selectionText)
//           } else {
//             store("copy-value-5", info.selectionText)
//           }
//         });
//     }
// });

// // Add a listener for the context menu item to paste the value "test"
// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//   if (info.menuItemId.startsWith("paste-from-")) {
//       // Paste the word "test" in the current editable field
//       command = info.menuItemId.split("paste-from-")[1];
//       chrome.scripting.executeScript({
//           target: { tabId: tab.id },
//           function: function() {
//               document.activeElement.value = document.activeElement.value + get_clipboard_command_value(command);
//           }
//       });
//   }
// });


// self.addEventListener('message', async (event) => {
//   if (event.data.action === 'appStateChanged') {
//       if (event.data.isUnlocked) {
//           try {
//               chrome.commands.getAll(async function(commands) {
//                   for (let command of commands) {
//                       if (!await isLocked()) {
//                           console.log("App unlocked, creating context menu")
//                           if (command.name.startsWith("copy-value")) {
//                               const value = await get_clipboard_command_value(command.name)
//                               console.log(value)
//                               chrome.contextMenus.create({
//                                   id: "paste-from-" + command.name,
//                                   title: "paste " + value.substring(0, 10) + ".. (" + command.shortcut + ")",
//                                   contexts: ["editable"]
//                               });
//                           }
//                       } else {
//                           console.log("App locked, not creating context menu")
//                       }
//                   }
//               });
//           } catch (error) {
//               chrome.contextMenus.update("paste-from-" + command.name, {
//                   title: "paste " + value.substring(0, 10) + " (" + command.shortcut + ")",
//               }, function() {
//                   if (chrome.runtime.lastError) {
//                       console.error(chrome.runtime.lastError.message);
//                   } else {
//                       console.log("Context menu item updated successfully");
//                   }
//               });
//           }
//       }
//   }
// // });
// self.addEventListener('message', async (event) => {
//   if (event.data.action === 'appStateChanged') {
//       if (event.data.isUnlocked) {
//           try {
//               chrome.commands.getAll(async function(commands) {
//                   for (let command of commands) {
//                       try {
//                         const value = await get_clipboard_command_value(command.name)
//                         chrome.contextMenus.update("paste-from-" + command.name, {
//                             title: "paste " + value.substring(0, 10) + " (" + command.shortcut + ")",
//                         });
//                       } catch {
//                               const value = await get_clipboard_command_value(command.name)
//                               chrome.contextMenus.create({
//                                   id: "paste-from-" + command.name,
//                                   title: "paste " + value.substring(0, 10) + ".. (" + command.shortcut + ")",
//                                   contexts: ["editable"]
//                               });
//                       }
//                   }
//               });
//           } catch (error) {
//               console.error(error);
//           }
//       }
//   }
// });

// self.addEventListener('message', (event) => {
//   if (event.data.action === 'appStateChanged') {
//       if (event.data.hasChanged) {
//         chrome.commands.getAll(async function(commands) {
//           commands.forEach(async function(command) {
//             if (! await isLocked ()) {
//               console.log("App unlocked, creating context menu")
//               if (command.name.startsWith("copy-value")) {
//                 const value = await get_clipboard_command_value(command.name)
//                 console.log(value)
//                 chrome.contextMenus.update("paste-from-" + command.name, {
//                   title: "paste " + value.substring(0, 10) + " (" + command.shortcut + ")",
//               }, function() {
//                   if (chrome.runtime.lastError) {
//                       console.error(chrome.runtime.lastError.message);
//                   } else {
//                       console.log("Context menu item updated successfully");
//                   }
//               });
//               }
//             } else {
//               console.log("App locked, not creating context menu")
//             }
//           });
//         });
//       }
//     }
//   });




// chrome.commands.getAll(async function(commands) {
//   if (!await isLocked()) {
//     commands.forEach(async function(command) {
//         if (command.name.startsWith("copy-value")) {
//           const value = await get_clipboard_command_value(command.name)
//           console.log(value)
//           chrome.contextMenus.create({
//             id: "paste-from-" + command.name,
//             title: "paste" + value.substring(0, 10) + " (" + command.shortcut + ")",
//             contexts: ["editable"]
//           });
//         }
//     });
//   }
// });

/////////////
// Scripts //
/////////////

// function getActiveTab(callback) {
//   // Query for the active tab in the current window
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     // tabs is an array, but there should only be one active tab in the current window, so take the first element
//     var tab = tabs[0];
//     // Now you have access to the tab's properties, including its ID
//     var tabId = tab.id;
//     callback(tabId);
//   });
// }

// // On tab Change
// chrome.tabs.onUpdated.addListener(function(activeInfo) {
//   getActiveTab(async function(tabId) {
//     chrome.scripting.executeScript({
//       target: { tabId: tabId },
//       function: new Function(await get("script"))
//     }).then(() => {
//       console.log("Script injected successfully");
//     }).catch((error) => {
//       console.log("Error injecting script: ", error);
//     });
//   });
// });

/////////////////////////////
// Page Notes Context Menu //
/////////////////////////////

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'mySidepanel') {
    chrome.contextMenus.create({
      id: "add-to-page-note",
      title: "Add to page note",
      contexts: ["selection"]
    })
    port.onDisconnect.addListener(async () => {
      chrome.contextMenus.remove(
        "add-to-page-note"
      )
    });
  }
});


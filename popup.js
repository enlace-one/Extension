console.log('Executing popup.js');

async function onStartSpecific() {
    if (! await isLocked()) {
        const inputBox = document.getElementById("search");
        inputBox.focus();
    }
}

// Add Keyboard Shortcuts
chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
        console.log('Command: ' + command.name);
        console.log('Shortcut: ' + command.shortcut);
        const element = document.getElementById(command.name + "-label")
        if (element && command.shortcut) {
            element.innerHTML = command.shortcut + " copies:"
        }
    });
});

onStartSpecific()

// Store new keys and set value. Select "Search" input box.
document.addEventListener("EnlaceUnlocked", async function() {
    console.log("triggered unlock stuff ")
    Array.from(document.getElementsByClassName("store-input-value")).forEach(async element => {
        try {
            if (await getSetting("encrypt-clipboard")) {
                element.value = await eGet(element.getAttribute("key"))
            } else {
                element.value = await get(element.getAttribute("key"))
            }
        } catch {
            console.log("No found value stored for " + element.getAttribute("key"))
        }
        element.addEventListener("change", async function() {
            console.log("triggered input onchange")
            if (await getSetting("encrypt-clipboard")) {
                eStore(element.getAttribute("key"), element.value)
            } else {
                store(element.getAttribute("key"), element.value)
            }
        });
    });
});



//////////////
// SNIPPETS //
//////////////

let data = {};
get("snippet-data").then((value) => {
    data = value || {};
  });


  let searchTimeout;
  let highlightedIndex = -1;

  document.getElementById('key').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
    }
  });
  document.getElementById('value').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
    }
  });
  document.getElementById('search').addEventListener('input', handleSearchInput);
  document.getElementById('search').addEventListener('keydown', handleResultKeyDown);

  async function storeKeyValue() {
    const keyInput = document.getElementById('key');
    const valueInput = document.getElementById('value');
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
        if (key.length > await getSetting("max-key-char-snippets")) {
            showNotification("Key is too long")
            return ""
        } else if (value.length > await getSetting("max-value-char-snippets")) {
            showNotification("Value is too long")
            return ""
        } else {
            if (await getSetting("encrypt-snippets")) {
                data[key] = encrypt(value)
            } else {
                data[key] = value;
            }
            store("snippet-data", data)
            keyInput.value = '';
            valueInput.value = '';
            showNotification("Stored value for '" + key +"'")
        }
    } else {
      showNotification("Error: Enter Key and value first")
    }
    
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchKeyValue, 500);
  }

  function searchKeyValue() {
    const searchKey = document.getElementById('search').value.trim();
    const resultTable = document.getElementById('result');
    resultTable.innerHTML = '';
    if (searchKey) {
      const matches = Object.keys(data).filter(key => key.startsWith(searchKey));
      if (matches.length > 0) {
        highlightedIndex = 0;
        const tableBody = document.createElement('tbody');
        matches.forEach(async (match, index) => {
          const row = tableBody.insertRow();
          row.style="border-radius: 5px;"
          const keyCell = row.insertCell();
          const valueCell = row.insertCell();
          const deleteCell = row.insertCell();
          keyCell.textContent = truncateText(match, 20) + ":";
          keyCell.classList.add("bold")
          keyCell.id = match
          if (await getSetting("encrypt-snippets")) {
                valueCell.textContent = truncateText(decrypt(data[match]), 50);
            } else {
                valueCell.textContent = truncateText(data[match], 50);
            }
          valueCell.style="width: 60vw;"
          valueCell.classList.add("truncate")
          deleteCell.textContent = "X"
          //deleteCell.attributes.add("key_id", match)
          deleteCell.addEventListener("click", function () {
             delete data[match];
             store("snippet-data", data)
             row.remove()
             showNotification("Deleted" + match)
          })
          if (index === highlightedIndex) {
            row.classList.add('highlighted');
          }
        });
        resultTable.appendChild(tableBody);
        
      } else {
        resultTable.textContent = `No matches found for '${searchKey}'.`;
      }
    }
  }

  async function handleResultKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const rows = document.querySelectorAll('#result tbody tr');
      if (rows.length > 0) {
        if (event.key === "ArrowDown") {
          highlightedIndex = (highlightedIndex + 1) % rows.length;
        } else if (event.key === "ArrowUp") {
          highlightedIndex = (highlightedIndex - 1 + rows.length) % rows.length;
        }
        rows.forEach((row, index) => {
          if (index === highlightedIndex) {
            row.classList.add('highlighted');
          } else {
            row.classList.remove('highlighted');
          }
        });
      }
    } else if (event.key === "Enter" && highlightedIndex !== -1) {
      const selectedKey = document.querySelectorAll('#result tbody tr')[highlightedIndex].cells[0].id;
      //const selectedValue = document.querySelectorAll('#result tbody tr')[highlightedIndex].cells[1].textContent;
        //   document.getElementById('key').value = selectedKey.trim();
        //   document.getElementById('value').value = selectedValue.trim();
        if (await getSetting("encrypt-snippets")) {
            navigator.clipboard.writeText(decrypt(data[selectedKey]));
        } else {
            navigator.clipboard.writeText(data[selectedKey]);
        }
        //navigator.clipboard.writeText(selectedValue);
        showNotification("Coped value for '" + selectedKey +"'")
        document.getElementById("search").value = ""
    }
  }

  //////////////////////////////
  // Handle Bottom Button Bar //
  //////////////////////////////
  


// In your popup script (popup.js):

document.getElementById('openOptionsPage').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});


  
// var query = { active: true, currentWindow: true };

// function callback(tabs) {
//   var currentTab = tabs[0]; // there will be only one in this array
//   return currentTab; // also has properties like currentTab.id
// }

// tab = chrome.tabs.query(query, callback);

// console.log(tab)

//   const tabId = tab.id;
//   const button = document.getElementById('openSidePanel');
//   button.addEventListener('click', async () => {
//     await chrome.sidePanel.open({ tabId });
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: 'sidepanel.html',
//       enabled: true
//     });
//   });

// Examples

// Save default API suggestions
// chrome.runtime.onInstalled.addListener(({ reason }) => {
//     if (reason === 'install') {
//       chrome.storage.local.set({
//         apiSuggestions: ['tabs', 'storage', 'scripting']
//       });
//     }
//   });


// // Only use this function during the initial install phase. After
// // installation the user may have intentionally unassigned commands.
// function checkCommandShortcuts() {
//     chrome.commands.getAll((commands) => {
//       let missingShortcuts = [];
  
//       for (let {name, shortcut} of commands) {
//         if (shortcut === '') {
//           missingShortcuts.push(name);
//         }
//       }
  
//       if (missingShortcuts.length > 0) {
//         // Update the extension UI to inform the user that one or more
//         // commands are currently unassigned.
//       }
//     });
//   }


// ,
//     "copy-value-4": {
//       "suggested_key": {
//         "default": "Ctrl+Shift+4",
//         "mac": "Command+Shift+4"
//       },
//       "description": "Copies value 4",
//       "global": true
//     },
//     "copy-value-5": {
//       "suggested_key": {
//         "default": "Ctrl+Shift+5",
//         "mac": "Command+Shift+5"
//       },
//       "description": "Copies value 5",
//       "global": true
//     },
//     "copy-value-6": {
//       "suggested_key": {
//         "default": "Ctrl+Shift+6",
//         "mac": "Command+Shift+6"
//       },
//       "description": "Copies value 6",
//       "global": true
//     },
//     "copy-value-7": {
//       "suggested_key": {
//         "default": "Ctrl+Shift+7",
//         "mac": "Command+Shift+7"
//       },
//       "description": "Copies value 7",
//       "global": true
//     },
//     "copy-value-8": {
//       "suggested_key": {
//         "default": "Ctrl+Shift+8",
//         "mac": "Command+Shift+8"
//       },
//       "description": "Copies value 8",
//       "global": true
//     },
//     "copy-value-9": {
//       "suggested_key": {
//         "default": "Ctrl+Shift+9",
//         "mac": "Command+Shift+9"
//       },
//       "description": "Copies value 9",
//       "global": true
//     }
console.log('Executing popup.js');

// Select PW box
document.addEventListener("DOMContentLoaded", function() {
    // Select the input box by its ID
    const inputBox = document.getElementById("password");

    // Focus on the input box
    inputBox.focus();
});

// Show/Hide 
function showhide(hideId) {
    var div = document.getElementById(hideId);
    div.classList.toggle('hidden'); 
  }

window.addEventListener("DOMContentLoaded", function() {
    Array.from(document.getElementsByClassName("hide-trigger")).forEach(element => {
        element.addEventListener("click", function() {
            
            Array.from(document.getElementsByClassName(element.getAttribute("hide-class"))).forEach(element => {
                element.classList.add("hidden")
            });

            showhide(element.getAttribute("hide-id"))
        });
    });
});

// JavaScript code to handle tab switching
document.addEventListener("DOMContentLoaded", function () {
    // Get all tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");

    // Add click event listener to each tab button
    tabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Remove 'active' class from all tab buttons
            tabButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            // Add 'active' class to the clicked tab button
            button.classList.add("active");

            // Get the ID of the tab to show
            const tabId = button.getAttribute("data-tab");

            // Hide all tab contents
            const tabContents = document.querySelectorAll(".tab-content");
            tabContents.forEach(function (content) {
                content.classList.remove("active");
            });

            // Show the tab content with the corresponding ID
            const tabContentToShow = document.getElementById(tabId);
            tabContentToShow.classList.add("active");
        });
    });
});


// // Select all elements with the attribute "menu-div-id"
// const elementsWithMenuDivId = document.querySelectorAll('[menu-div-id]');

// // Loop through the selected elements
// elementsWithMenuDivId.forEach(element => {
//     // Do something with each element
//     element.addEventListener("click", function() {
//         showhide(element.getAttribute("menu-div-id"))
//         element.classList.toggle("menu-open")
//     });
// });


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

// Hover over help Text
document.addEventListener('DOMContentLoaded', function () {
    var tooltips = document.querySelectorAll('[hover-text]');

    tooltips.forEach(function (tooltip) {
        tooltip.classList.add('hover-text-trigger')
        var tooltipText = tooltip.getAttribute('hover-text');
        var tooltipElement = document.createElement('div');
        tooltipElement.classList.add('tooltiptext');
        tooltipElement.textContent = tooltipText;
        tooltip.appendChild(tooltipElement);
    });
});




// Lock/Unlock
const validation_salt = "Validation129"
const storage_salt = "Enlsal294"

async function getValidationSalt() {
    var salt = await get("enlace-vs")
    if (salt === undefined) {
        console.log("Generating Validation Salt")
        salt = generateRandomAlphaNumeric(10)
        store("enlace-vs", salt)
    }
    return salt
}

async function getStorageSalt() {
    var salt = await get("enlace-ss")
    if (salt === undefined) {
        console.log("Generating Storage Salt")
        salt = generateRandomAlphaNumeric(10)
        store("enlace-ss", salt)
    }
    return salt
}

function lock() {
    chrome.storage.session.set({"en_locked": true});
    showhide("locked-div");
    showhide("unlocked-div");
}


async function unlock(key) {
    const hashValidation = await hashString(key + await getValidationSalt())
    if (hashValidation == await get("hashValidation")) {
        // Store for unlocking
        const hashKey = await hashString(key + await getStorageSalt())
        chrome.storage.session.set({"en_locked": hashKey});
        runOnUnlock()
    } else {
        console.log("Incorrect password")
    }
}

async function runOnUnlock() {
    console.log("Unlocked")
    // Send the event
    const event = new Event('EnlaceUnlocked');
    document.dispatchEvent(event);
    // Handles the HTML
    showhide("locked-div");
    showhide("unlocked-div");
    document.getElementById("password").value = "";
}

async function setPassword(key) {
    // They will not be able to unencrypt already encrypted items
    console.log("Setting pw")
    const hashValidation = await hashString(key + await getValidationSalt())
    store("hashValidation", hashValidation)
}

async function onStart() {
    if (! await isLocked()) {
        runOnUnlock()
    }
}

onStart()

// Enter password on "Enter"
document.getElementById("password").addEventListener('keydown', async function(event) {
    if (event.key === 'Enter') {
        if (document.getElementById('set-reset-pw').checked) {
            await setPassword(document.getElementById("password").value)
            await unlock(document.getElementById("password").value)
            document.getElementById('set-reset-pw').checked = false
        } else {
            await unlock(document.getElementById("password").value)
        }
    }
});

document.getElementById("lock-button").addEventListener('click', async function () {
    lock()
})

// Store new keys and set value
document.addEventListener("EnlaceUnlocked", async function() {
    console.log("triggered unlock stuff ")
    Array.from(document.getElementsByClassName("store-input-value")).forEach(async element => {
        try {
            element.value = await eGet(element.getAttribute("key"))
        } catch {
            console.log("No found value stored for " + element.getAttribute("key"))
        }
        element.addEventListener("change", function() {
            console.log("triggered input onchange")
            eStore(element.getAttribute("key"), element.value)
        });
    });
});


// Set Variables
const variables = {
    extensionName: "Enlace Assistant",
    clipboardName: "Clipboard",
    snippetsName: "Snippets"
  }
  
window.addEventListener("DOMContentLoaded", function() {
for (const v in variables) {
    Array.from(document.getElementsByClassName(v)).forEach(element => {
    element.innerHTML = variables[v];
    });
}
});



//////////////
// SNIPPETS //
//////////////
const data = {};
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
  document.getElementById('result').addEventListener('keydown', handleResultKeyDown);

  function storeKeyValue() {
    const keyInput = document.getElementById('key');
    const valueInput = document.getElementById('value');
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
      data[key] = value;
      keyInput.value = '';
      valueInput.value = '';
    }
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchKeyValue, 500);
  }

  function searchKeyValue() {
    const searchKey = document.getElementById('search').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    if (searchKey) {
      const matches = Object.keys(data).filter(key => key.startsWith(searchKey));
      if (matches.length > 0) {
        highlightedIndex = 0;
        const resultList = document.createElement('ul');
        matches.forEach((match, index) => {
          const listItem = document.createElement('li');
          listItem.textContent = `${match}: ${data[match]}`;
          if (index === highlightedIndex) {
            listItem.classList.add('highlighted');
          }
          resultList.appendChild(listItem);
        });
        resultDiv.appendChild(resultList);
      } else {
        resultDiv.textContent = `No matches found for '${searchKey}'.`;
      }
    }
  }

  function handleResultKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const matches = document.querySelectorAll('#result ul li');
      if (matches.length > 0) {
        if (event.key === "ArrowDown") {
          highlightedIndex = (highlightedIndex + 1) % matches.length;
        } else if (event.key === "ArrowUp") {
          highlightedIndex = (highlightedIndex - 1 + matches.length) % matches.length;
        }
        matches.forEach((match, index) => {
          if (index === highlightedIndex) {
            match.classList.add('highlighted');
          } else {
            match.classList.remove('highlighted');
          }
        });
      }
    } else if (event.key === "Enter" && highlightedIndex !== -1) {
      const selectedValue = document.querySelectorAll('#result ul li')[highlightedIndex].textContent.split(': ')[1];
      if (selectedValue) {
        navigator.clipboard.writeText(selectedValue)
        //document.getElementById('value').value = selectedValue.trim();
      }
    }
  }


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
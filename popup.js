console.log('Executing popup.js');

///////////////
// Clipboard //
///////////////


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
    const copy_html = '<button id="copy-{ID}" style="width: 8vw;"><img style="width: 100%; height: auto;" src="images/copy.svg" alt="Icon"></button>'
    const paste_html = '<button id="paste-{ID}" style="width: 8vw;"><img style="width: 100%; height: auto;" src="images/paste.svg" alt="Icon"></button>'

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
             
            navigator.serviceWorker.controller.postMessage({
                action: 'appStateChanged',
                hasChanged: true
            });
            if (await getSetting("encrypt-clipboard")) {
                eStore(element.getAttribute("key"), element.value)
            } else {
                store(element.getAttribute("key"), element.value)
            }
            showNotification("Saved")
        });

        // Add copy/paste button after the variable element
        const copyButton = copy_html.replace("{ID}", element.getAttribute("key"));
        const pasteButton = paste_html.replace("{ID}", element.getAttribute("key"));
        element.insertAdjacentHTML('afterend', copyButton + pasteButton);

        // Add event listeners for the copy and paste buttons
        document.getElementById("copy-" + element.getAttribute("key")).addEventListener("click", function() {
            element.select()
            document.execCommand('copy');
            showNotification("Copied");
        });
        document.getElementById("paste-" + element.getAttribute("key")).addEventListener("click", async function() {
            const text = await navigator.clipboard.readText();
            element.value = text;
            showNotification("Pasted");
        });

    });


});



//////////////
// SNIPPETS //
//////////////


async function onStartSpecific() {
    if (! await isLocked()) {
        const inputBox = document.getElementById("search");
        inputBox.focus();
    }
}

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

//////////////////////////
// Passphrase generator //
//////////////////////////

document.getElementById("pp-generator-run").addEventListener("click", runPPGenerator)
function toTitleCase(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}

async function runPPGenerator() {
    const seperator = document.getElementById("pp-generator-seperator").value;
    const capitalization = document.getElementById("pp-generator-case").value;
    let count = document.getElementById("pp-generator-count").value;
    const useSmallWords = document.getElementById("pp-generator-smallWords").checked;
    const useNumbers = document.getElementById("pp-generator-number").checked;
    
    let wordlist = 'word-list.txt'
    if (useSmallWords) {
        wordlist = 'short-word-list.txt'
    }

    if (useNumbers) {
        count -= 1;
    }

    let words = await getRandomWords(count, wordlist)
    words = words.map(word => {
        if (capitalization === "upper") {
            return word.toUpperCase();
        } else if (capitalization === "lower") {
            return word.toLowerCase();
        } else {
            return toTitleCase(word);
        }
    });
    words = words.join(seperator)

    if (useNumbers) {
        words += seperator + Math.floor(Math.random() * 100).toString();
    }
    
    document.getElementById("pp-generator-output").value = words;
}

const defaultPPGeneratorSettings = {
    count: 3,
    case: "title",
    seperator: "-",
    number: true,
    smallWords: true,
};

function setPPGeneratorValues() {
    for (const key in defaultPPGeneratorSettings) {
        getPPGeneratorSetting(key).then((value) => {
            const element = document.getElementById(`pp-generator-${key}`);
            if (element && element.type === "checkbox") {
                element.checked = value;
            } else if (element) {
                element.value = value;
            }
        });
    }
    setTimeout(() => runPPGenerator(), 1000)
}
setPPGeneratorValues();


function getRandomWords(count, wordListFileName = 'word-list.txt') {
    return fetch(wordListFileName)
        .then(response => response.text())
        .then(data => {
            // Split the data into an array of words
            const wordArray = data.split('\n');

            let words = [];

            for (let i = 0; i < count; i++) {
                // Get a random word from the array
                const randomIndex = Math.floor(Math.random() * wordArray.length);
                const randomWord = wordArray[randomIndex];
                words.push(randomWord.trim()); // trim any leading/trailing spaces
            }
            return words;
        })
        .catch(error => {
            console.error('Error fetching word list:', error);
            return []; // return an empty array in case of error
        });
}

document.getElementById("pp-generator-copy").addEventListener("click", function () {
    document.getElementById("pp-generator-output").select();
    document.execCommand('copy');
    showNotification("Copied")
})


// Function to get generator setting
async function getPPGeneratorSetting(setting_name) {
    const generatorSettings = await get("pp-generator-settings") || {};
    return generatorSettings.hasOwnProperty(setting_name) ? generatorSettings[setting_name] : defaultPPGeneratorSettings[setting_name];
}


// Save Generator Settings
document.getElementById("pp-generator-save-preferences").addEventListener("click", async function() {
    for (const key in defaultPPGeneratorSettings) {
        const element = document.getElementById(`pp-generator-${key}`);
        if (element && element.type === "checkbox") {
            await storePPGeneratorSetting(key, element.checked);
        } else if (element) {
            await storePPGeneratorSetting(key, element.value);
        }
    }
    showNotification("Generator Settings Saved");
});

// Function to store generator setting
async function storePPGeneratorSetting(setting_name, value) {
    const generatorSettings = (await get("pp-generator-settings")) || {};
    generatorSettings[setting_name] = value;
    await store("pp-generator-settings", generatorSettings);
}

document.getElementById("pp-generator-revert-preferences").addEventListener("click", async function () {
    store("pp-generator-settings", {});
    setPPGeneratorValues();

})
  
//////////////////////////////
// Handle Bottom Button Bar //
//////////////////////////////
  


// In your popup script (popup.js):

document.getElementById('openOptionsPage').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});
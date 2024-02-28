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

////////////////////////
// Password Generator //
////////////////////////


document.getElementById("generator-run").addEventListener("click", runGenerator)

function runGenerator() {
    // Get input values
    const length = parseInt(document.getElementById("generator-length").value);
    const includeLowercase = document.getElementById("generator-includeLowercase").checked;
    const includeUppercase = document.getElementById("generator-includeUppercase").checked;
    const includeNumbers = document.getElementById("generator-includeNumbers").checked;
    const includeSpecialChars = document.getElementById("generator-includeSpecialChars").checked;
    const specialChars = document.getElementById("generator-specialChars").value;
    const minNumbers = parseInt(document.getElementById("generator-minNumbers").value);
    const minLowercase = parseInt(document.getElementById("generator-minLowercase").value);
    const minUppercase = parseInt(document.getElementById("generator-minUppercase").value);
    const minSpecialChars = parseInt(document.getElementById("generator-minSpecialChars").value);
    const avoidAmbiguousChars = document.getElementById("generator-avoidAmbiguousChars").checked;
    let lowercaseChar = 'abcdefghijklmnopqrstuvwxyz'
    let uppercaseChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let numericChar = '0123456789'

    if (avoidAmbiguousChars) {
        uppercaseChar = uppercaseChar.replace("I", "")
        lowercaseChar = lowercaseChar.replace("l", "")
        numericChar = numericChar.replace("1", "")
        uppercaseChar = uppercaseChar.replace("O", "")
        numericChar = numericChar.replace("0", "")
    }

    // Define character sets
    let chars = '';
    if (includeLowercase) chars += lowercaseChar
    if (includeUppercase) chars += uppercaseChar;
    if (includeNumbers) chars += numericChar;
    if (includeSpecialChars) chars += specialChars;

    // Generate password
    let password = '';
    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const getRandomIndex = () => Math.floor(Math.random() * password.length);

    // Ensure minimum requirements
    for (let i = 0; i < minNumbers; i++) {
        password += numericChar[Math.floor(Math.random() * numericChar.length)]
    }
    for (let i = 0; i < minLowercase; i++) {
        password += lowercaseChar[Math.floor(Math.random() * lowercaseChar.length)]
    }
    for (let i = 0; i < minUppercase; i++) {
        password += uppercaseChar[Math.floor(Math.random() * uppercaseChar.length)];
    }
    for (let i = 0; i < minSpecialChars; i++) {
        password += specialChars[Math.floor(Math.random() * specialChars.length)]
    }

    // Generate remaining characters to meet length requirement
    while (password.length < length) {
        password += getRandomChar();
    }

    // Shuffle password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    // Display password
    document.getElementById("generator-output").value = password;
}

const defaultGeneratorSettings = {
    length: 18,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSpecialChars: true,
    specialChars: "!$?@#%*",
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSpecialChars: 1,
    avoidAmbiguousChars: true
};

function setGeneratorValues() {
    for (const key in defaultGeneratorSettings) {
        getGeneratorSetting(key).then((value) => {
            const element = document.getElementById(`generator-${key}`);
            if (element && element.type === "checkbox") {
                element.checked = value;
            } else if (element) {
                element.value = value;
            }
        });
    }
    setTimeout(() => runGenerator(), 1000)
}
setGeneratorValues();

// Save Generator Settings
document.getElementById("generator-save-preferences").addEventListener("click", async function() {
    for (const key in defaultGeneratorSettings) {
        const element = document.getElementById(`generator-${key}`);
        if (element && element.type === "checkbox") {
            await storeGeneratorSetting(key, element.checked);
        } else if (element) {
            await storeGeneratorSetting(key, element.value);
        }
    }
    showNotification("Generator Settings Saved");
});

document.getElementById("generator-revert-preferences").addEventListener("click", async function () {
    store("generator-settings", {});
    setGeneratorValues();

})

// Function to get generator setting
async function getGeneratorSetting(setting_name) {
    const generatorSettings = await get("generator-settings") || {};
    return generatorSettings.hasOwnProperty(setting_name) ? generatorSettings[setting_name] : defaultGeneratorSettings[setting_name];
}

// Function to store generator setting
async function storeGeneratorSetting(setting_name, value) {
    const generatorSettings = (await get("generator-settings")) || {};
    generatorSettings[setting_name] = value;
    await store("generator-settings", generatorSettings);
}


document.getElementById("generator-copy").addEventListener("click", function () {
    document.getElementById("generator-output").select();
    document.execCommand('copy');
    showNotification("Copied")
})

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
  
/////////////
// Cookies //
/////////////

// // Get all cookies
// document.getElementById("get-cookies").addEventListener("click", function () {
//     chrome.cookies.getAll({}, function (cookies) {
//         console.log(cookies)
//         document.getElementById("cookie-output").value = JSON.stringify(cookies, null, 2);
//     });
// })

document.addEventListener("DOMContentLoaded", function() {
    loadCookies();
});

document.getElementById("search-cookies-button").addEventListener("click", function () {
    loadCookies(document.getElementById("search-cookies").value);
});

document.getElementById("search-cookies").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        loadCookies(document.getElementById("search-cookies").value);
    }
});

function loadCookies(text_to_search = "") {
    const site_only = document.getElementById("filter-by-site-cookies").checked;
    if (site_only) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const url = new URL(tabs[0].url);
            const domain = url.hostname;
            chrome.cookies.getAll({domain: domain}, function (cookies) {
                displayCookies(cookies, text_to_search);
            });
        });
    } else {
        chrome.cookies.getAll({}, function (cookies) {
            displayCookies(cookies, text_to_search);
        });
    }
}


function displayCookies(cookies, text_to_search) {
    // Edit and Delete not working, need to style list items
    const list = document.getElementById('cookie-list');
    list.innerHTML = ''; // clear the list

    for (let cookie of cookies) {
        if (text_to_search && !JSON.stringify(cookie).toLowerCase().includes(text_to_search.toLowerCase())) {
            continue;
        }
        // Create a list item for each cookie
        const listItem = document.createElement('li');
        listItem.classList.add('cookie-item');

        // Create a button to toggle the visibility of the cookie details
        const toggleButton = document.createElement('button');
        toggleButton.textContent = `${cookie.name} - ${cookie.domain}`;
        toggleButton.addEventListener('click', () => {
            detailDiv.style.display = detailDiv.style.display === 'none' ? '' : 'none';
        });
        toggleButton.classList.add("subtle-button")
        listItem.appendChild(toggleButton);

        const detailDiv = document.createElement('div');
        detailDiv.style.display = 'none';

        // Create a textarea to hold the cookie details
        const detailsTextarea = document.createElement('textarea');
        detailsTextarea.rows = 10;
        detailsTextarea.cols = 50;
        // detailsTextarea.style.display = 'none'; // hide the textarea by default
        detailsTextarea.textContent = JSON.stringify(cookie, null, 2);
        detailsTextarea.readOnly = true;
        detailDiv.appendChild(detailsTextarea);

        // Create a delete button
        const deleteButton = document.createElement('button');
        
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            chrome.cookies.remove({url: "http://" + cookie.domain + cookie.path, name: cookie.name}, function(deletedCookie) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else {
                    console.log(deletedCookie);
                    // Remove the list item from the list
                    list.removeChild(listItem);
                }
            });
        });
        // deleteButton.style.display = 'none';
        detailDiv.appendChild(deleteButton);

        // Create an edit button
        if (cookie.httpOnly) {
            const httpOnlyWarning = document.createElement('small');
            httpOnlyWarning.textContent = '  This cookie cannot be edited (httpOnly)';
            detailDiv.appendChild(httpOnlyWarning);
        } else if (cookie.domain.startsWith('.')) { 
            const httpOnlyWarning = document.createElement('small');
            httpOnlyWarning.textContent = "  This cookie cannot be edited (cookie's domain starts with a dot)";
            detailDiv.appendChild(httpOnlyWarning);
        } else {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                // Make the textarea editable and focus it
                detailsTextarea.readOnly = false;
                detailsTextarea.focus();
            });
            detailDiv.appendChild(editButton);
        }
        listItem.appendChild(detailDiv);

        // Add an event listener for when the textarea loses focus
        detailsTextarea.addEventListener('blur', () => {
            // Make the textarea read-only again
            detailsTextarea.readOnly = true;

            // Parse the edited JSON and save the changes to the cookie
            try {
                console.log(detailsTextarea.value)
                const editedCookie = JSON.parse(detailsTextarea.value);
                console.log(editedCookie.value)
                console.log(cookie.domain + cookie.path)
                chrome.cookies.set({
                    url: "https://" + cookie.domain + cookie.path,
                    name: cookie.name,
                    value: editedCookie.value,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    // Add other cookie properties here if needed
                }, function(cookie) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        showNotification("Error: " + chrome.runtime.lastError.message)
                    } else {
                        console.log(cookie);
                        showNotification("Cookie updated")
                    }
                });
            } catch (error) {
                console.error('Invalid JSON:', error);
                showNotification("Error: Invalid JSON. " + error)
            }
        });

        // Add the list item to the list
        list.appendChild(listItem);
    }
}

document.getElementById("cookies-delete-site").addEventListener("click", function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        chrome.cookies.getAll({domain: domain}, function (cookies) {
            cookies.forEach(cookie => {
                chrome.cookies.remove({url: "https://" + cookie.domain + cookie.path, name: cookie.name}, function(deletedCookie) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    } else {
                        console.log(deletedCookie);
                    }
                });
            });
        });
    });
    showNotification("Deleted all cookies for this site")
    // Wait 1 second before reloading the cookies
    setTimeout(() => loadCookies(document.getElementById("search-cookies").value), 1000);
});


document.getElementById("cookies-delete-all").addEventListener("click", function () {
    chrome.cookies.getAll({}, function (cookies) { // Pass an empty object as the first argument
        cookies.forEach(cookie => {
            // Try to remove the cookie with a http:// URL
            chrome.cookies.remove({url: "https://" + cookie.domain + cookie.path, name: cookie.name}, function(deletedCookie) {
                if (chrome.runtime.lastError) {
                    // If that fails, try to remove the cookie with a https:// URL
                    chrome.cookies.remove({url: "http://" + cookie.domain + cookie.path, name: cookie.name}, function(deletedCookie) {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                        } else {
                            console.log("Deleted " + deletedCookie);
                        }
                    });
                } else {
                    console.log("Deleted " + deletedCookie);
                }
            });
        });
    });
    showNotification("Deleted all cookies")
    // Wait 1 second before reloading the cookies
    setTimeout(() => loadCookies(document.getElementById("search-cookies").value), 1000);
});

//////////////////////////////
// Handle Bottom Button Bar //
//////////////////////////////
  


// In your popup script (popup.js):

document.getElementById('openOptionsPage').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});
////////////////
// Page Notes //
////////////////
displayFullTable = true
thoroughSearch = true
thisIsOptionsView = true

///////////
// STATS //
///////////
document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.sync.get(function(result) {
        var numItems = Object.keys(result).length;
        console.log("Number of items stored (of 512): " + numItems);
        document.getElementById("total-storage-count").innerText = numItems

        var bytes = JSON.stringify(result).length * 2; // Multiply by 2 to account for UTF-16 encoding
        document.getElementById("total-storage-space").innerText = bytes
        console.log("Size of data in bytes (of 102400): " + bytes);

        for (key of Object.keys(result)) {
            console.log("Size of", key, JSON.stringify(result[key]).length * 2)
        }

        // var pageNoteBytes = JSON.stringify(result["page-note-data"]).length * 2; // Multiply by 2 to account for UTF-16 encoding
        // // document.getElementById("page-notes-space").innerText = pageNoteBytes
        // console.log("Size of page note data in bytes (of 102400): " + pageNoteBytes);

        // try {
        //     var snippetsBytes = JSON.stringify(result["snippet-data"]).length * 2; // Multiply by 2 to account for UTF-16 encoding
        //     document.getElementById("snippets-space").innerText = snippetsBytes
        // } catch (error) {
        //     console.log("No snippets found")
        // }
    });
});

//////////////
// SETTINGS //
//////////////

// Default Settings
for (const key in default_settings) {
    getSetting(key).then((value)=> {
        // Set the value of the element with key as its ID
        const element = document.getElementById(key);
        if (element && element.type === "checkbox") {
            if (value) {
                element.checked = true 
            } else {
                element.checked = false
            }
        } else if (element) {
            element.value = value
        }
    });
}

const pageNoteJson = document.getElementById("page-note-json")

get("page-note-json").then((value)=> {
    if (value != "" && value != null && value != 0 && value != undefined) {
        pageNoteJson.value = JSON.stringify(value, null, 4)
    } else {
        pageNoteJson.value = JSON.stringify(defaultPageNoteConfig, null, 4)
        
    }
})

const allSettingsJsonTextarea = document.getElementById("all-settings-json")
getAllSettings().then((value) => {
    if (value != "" && value != null && value != 0 && value != undefined) {
        allSettingsJsonTextarea.value = JSON.stringify(value, null, 4)
    } else {
        allSettingsJsonTextarea.value = JSON.stringify(default_settings, null, 4)
    }
})

document.getElementById("reset-page-note-config").addEventListener("click", function () {
    pageNoteJson.value = JSON.stringify(defaultPageNoteConfig, null, 4)
    store("page-note-json", defaultPageNoteConfig)
    showNotification("Saved")
})

document.getElementById("reset-all-settings-json").addEventListener("click", function () {
    store("enlace-settings", default_settings)
    allSettingsJsonTextarea.value = JSON.stringify(default_settings, null, 4)
})

document.getElementById("save-all-settings-json").addEventListener("click", function () {
    try {
        const settingJsonValue = JSON.parse(allSettingsJsonTextarea.value)
        store("enlace-settings", settingJsonValue)
        showNotification("Saved")
    } catch (e) {
        alert(`Error saving JSON ${e}`)
    }
})

// Save
document.getElementById("save_settings").addEventListener("click", async function() {
    for (let key in default_settings) {
        // Set the value of the element with key as its ID
        const element = document.getElementById(key);
        if (element && element.type === "checkbox") {
            if (element.checked) {
                await storeSetting(key, true)
            } else {
                await storeSetting(key, false)
            }
        } else if (element) {
            await storeSetting(key, element.value)
        }
    }
    try {
        const pageNoteJsonValue = JSON.parse(pageNoteJson.value)
        store("page-note-json", pageNoteJsonValue)
        showNotification("Saved")
    } catch (e) {
        alert(`Error saving JSON ${e}`)
    }
});

document.getElementById("reset-settings").addEventListener("click", function (){
    store("enlace-settings", {})
})

// document.getElementById("reset-snippets").addEventListener("click", function (){
//     store("snippet-data", {})
// })

async function deleteAllPageNotes() {
    results = await chrome.storage.sync.get()
    for (result in results) {
        if (result.startsWith("mde_")) {
            chrome.storage.sync.remove(result)
        }
}}

document.getElementById("reset-page-notes").addEventListener("click", function (){
   deleteAllPageNotes()
})

document.getElementById("reset-clipboard").addEventListener("click", function (){
    chrome.commands.getAll(function(commands) {
        commands.forEach(function(command) {
            if (command.name.startsWith("copy-value")) {
                store(command.name, "")
            }
        });
    });
})

///////////
// Regex //
///////////

document.getElementById('regexCode').addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const regexCode = new RegExp(document.getElementById('regexCode').value);
    
        Array.from(document.getElementsByClassName('regexMatch')).forEach(element => {
            if (regexCode.test(element.value)) {
                console.log("Success! Match matches")
                element.classList.add("succeeded")
                element.classList.remove("failed")
            } else {
                console.log("Failure. Match fails")
                element.classList.remove("succeeded")
                element.classList.add("failed")
            }
        });

        Array.from(document.getElementsByClassName('regexFail')).forEach(element => {
            if (regexCode.test(element.value)) {
                console.log("Failure. Fail matches")
                element.classList.remove("succeeded")
                element.classList.add("failed")
            } else {
                console.log("Success! Fail fails")
                element.classList.add("succeeded")
                element.classList.remove("failed")
            }
        });    
    }
});

// Get all the "X" elements
const deleteButtons = document.querySelectorAll('.regexTest td:last-child');

// Add event listener to each "X" element
deleteButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Hide the parent row
    const row = button.parentNode;
    row.remove()
  });
});


const addRowButton = document.getElementById('addRowButton');
const regexTable = document.getElementById('regexTable');
const sampleRegexRow = document.getElementById("sampleRegexRow");

addRowButton.addEventListener('click', function() {
    const newRow = sampleRegexRow.cloneNode(true);
    newRow.classList.add('regexTest');
    regexTable.appendChild(newRow);
  });

//////////////
// Replacer //
//////////////

const replacerFind = document.getElementById("replacer-find")
const replacerReplaceWith = document.getElementById("replacer-replace-with")
const replacerInput = document.getElementById("replacer-input")
const replacerOutput = document.getElementById("replacer-output")

document.getElementById("replacer-switch").addEventListener("click", function() {
    const input = replacerInput.value
    replacerInput.value = replacerOutput.value
    replacerOutput.value = input
})

document.getElementById("replacer-regex-switch").addEventListener("click", function() {
    const find = replacerFind.value
    replacerFind.value = replacerReplaceWith.value
    replacerReplaceWith.value = find
})

document.getElementById("runReplacer").addEventListener("click", function () {
    const find = replacerFind.value
    const replaceWith = replacerReplaceWith.value
    const input = replacerInput.value
    const output = replacerOutput
    let countReplaced = 0;

    // Replace all instaces of "find" with "replaceWith" in 
    // "input" and set output.value as that. Keep the count as well
    const replacedString = input.replace(new RegExp(find, 'g'), replaceWith);
    countReplaced = (input.match(new RegExp(find, 'g')) || []).length;

    // Set the value of the "output" element to the modified string
    output.value = replacedString;

    // Display the number of replacements made
    showNotification(`Replaced ${countReplaced} occurrences`)
})

//////////
// HTML //
//////////
document.getElementById("html-editor").addEventListener("input", function() {
    const editorContent = document.getElementById('html-editor').value;
    const iframe = document.getElementById('html-viewer');
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(editorContent);
    doc.close();
    //ocument.getElementById('html-viewer').innerHTML = editorContent;
})

/////////////
// Scripts //
/////////////
const USER_SCRIPT_ID = 'default';
const default_script = `// Get current url
var url = window.location.href;

// Check if url includes a certain phrase
if (url.includes("https://www.google.com/")) {
    console.log("This is a Google search results page");
}

// Custom keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        console.log("Ctrl + S pressed");
    }
});

// Set all links to open in a new tab
if (url.includes("https://xyz.abc.hij/")) {
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute('target', '_blank');
    }
}

// Trigger the page to refresh every 60 seconds
const continue_refreshing = true;
if (url.includes("https://klm.abc.hij/")) {
    function refresh(seconds=60) {
        setTimeout(function() {
            if (!continue_refreshing) {
                return;
            }
            location.reload();
            refresh(seconds);
        }, seconds * 1000);
    }
    refresh()
}

// Click a button in the dom every 60 seconds
if (url.includes("https://def.abc.hij/")) {
    function clickButton(seconds=60) {
        setTimeout(function() {
            if (!continue_refreshing) {
                return;
            }
            document.querySelector('#my_button').click();
            clickButton(seconds);
        }, seconds * 1000);
    }
    clickButton()

}`

async function updateUi() {
    if (!isUserScriptsAvailable()) return;
  
    // Access settings from storage with default values.
    const script = await chrome.storage.sync.get({
      userScript: default_script
    });
  
    // Update UI with current values.
    document.getElementById("script-editor").value = script["userScript"];
  }


if (isUserScriptsAvailable()) {
    document.querySelector('.scriptName[data-tab="script-tab"]').classList.remove("hidden")
    document.querySelector('.regexName[data-tab="regex-tab"]').classList.remove("hidden")
    document.querySelector('.htmlName[data-tab="html-tab"]').classList.remove("hidden")
    document.querySelector(".page-note-settings").classList.remove("hidden")
    updateUi()
}
    

document.getElementById("script-editor").addEventListener("keydown", async function(event) {
    // If CTRL + Enter
    if (event.ctrlKey && event.key === "Enter") {
        const script = document.getElementById('script-editor').value;
        chrome.storage.sync.set({userScript: script}, function() {
            showNotification("Script saved")
        });
        const existingScripts = await chrome.userScripts.getScripts({
            ids: [USER_SCRIPT_ID]
          });
        
          if (existingScripts.length > 0) {
            // Update existing script.
            await chrome.userScripts.update([
              {
                id: USER_SCRIPT_ID,
                matches: ['<all_urls>'],
                world: 'MAIN',
                js: [{ code: script}]
              }
            ]);
          } else {
            // Register new script.
            await chrome.userScripts.register([
              {
                id: USER_SCRIPT_ID,
                matches: ['<all_urls>'],
                world: 'MAIN',
                js: [{ code: script}]
              }
            ]);
          }
    }

});

document.addEventListener("DOMContentLoaded", function() {
    // Open Page Note from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramName = "pageNote"; 
    if (urlParams.has(paramName)) {
        var paramValue = urlParams.get(paramName);
        console.log("Parameter value:", paramValue);
        document.getElementById("page-notes-super-tab").click();
        open_page_note(paramValue);
    }

    
});

// Create a function to open the sidebar and add "?page=KeyboardShortcuts" to the url 
function openSidePanelToKeyBoardShortcuts () {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.sidePanel.open({ tabId: tab.id });

        setTimeout(function() {
            try {
                chrome.runtime.sendMessage({
                    type: 'open-key-board-shortcuts',
                    target: 'sidepanel',
                    data: true
                });
            } catch (e) {
                console.log("failed to open keyboard shortcuts", e)
            }
        }, 100)
    });
}


document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "?") {
        console.log("opening side panel")
        openSidePanelToKeyBoardShortcuts()
    }
})


document.getElementById("delete-expired-page-note-button").addEventListener("click", function () {
    showNotification("Deleted expired page notes")
})

document.getElementById("open-url-pattern").addEventListener("click", function() {
    let url = urlPatternElement.value;
    url = url.split("|")[0];

    // Assuming the URL is regex escaped, we need to unescape it
    // This is a basic example and might need to be adjusted based on specific escape rules
    url = url.replace(/\\([.*+?^${}()|\[\]\/\\])/g, '$1');

    // Open the URL in a new tab
    // window.open(url, '_blank');
    chrome.tabs.create({ url: url });
});
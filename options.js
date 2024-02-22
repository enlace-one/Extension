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

        // var pageNoteBytes = JSON.stringify(result["page-note-data"]).length * 2; // Multiply by 2 to account for UTF-16 encoding
        // document.getElementById("page-notes-space").innerText = pageNoteBytes
        //console.log("Size of data in bytes (of 102400): " + bytes);

        var snippetsBytes = JSON.stringify(result["snippet-data"]).length * 2; // Multiply by 2 to account for UTF-16 encoding
        document.getElementById("snippets-space").innerText = snippetsBytes
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

// Save
document.getElementById("save_settings").addEventListener("click", function() {
    for (let key in default_settings) {
        // Set the value of the element with key as its ID
        const element = document.getElementById(key);
        if (element && element.type === "checkbox") {
            if (element.checked) {
                storeSetting(key, true)
            } else {
                storeSetting(key, false)
            }
        } else if (element) {
            storeSetting(key, element.value)
        }
    }
    showNotification("Saved")
});

document.getElementById("reset-settings").addEventListener("click", function (){
    store("enlace-settings", {})
})

document.getElementById("reset-snippets").addEventListener("click", function (){
    store("snippet-data", {})
})

async function deleteAllPageNotes() {
    results = await chrome.storage.sync.get()
    for (result in results) {
        if (result.startsWith("page-note-data-")) {
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

document.getElementById("runReplacer").addEventListener("click", function () {
    const find = document.getElementById("replacer-find").value
    const replaceWith = document.getElementById("replacer-replace-with").value
    const input = document.getElementById("replacer-input").value
    const output = document.getElementById("replacer-output")
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
    document.getElementById('html-viewer').innerHTML = editorContent;
})
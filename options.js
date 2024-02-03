//////////////
// SETTINGS //
//////////////

// Default Settings
for (const key in default_settings) {
    const value = default_settings[key];
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
}

// Save
document.getElementById("save_settings").addEventListener("click", function() {
    for (let key in default_settings) {
        const value = default_settings[key];
        // Set the value of the element with key as its ID
        const element = document.getElementById(key);
        if (element && element.type === "checkbox") {
            if (element.checked) {
                storeSetting(key, true)
            } else {
                storeSetting(key, false)
            }
        } else if (element) {
            storeSetting(key, value)
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

document.getElementById("reset-page-notes").addEventListener("click", function (){
    store("page-note-data", {})
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

// document.getElementById('runButton').addEventListener('click', () => {
//     const regexCode = new RegExp(document.getElementById('regexCode').value);
    
//     Array.from(document.getElementsByClassName('regexMatch')).forEach(element => {
//         if (regexCode.test(element.value)) {
//             console.log("Success! Match matches")
//             element.classList.add("succeeded")
//             element.classList.remove("failed")
//         } else {
//             console.log("Failure. Match fails")
//             element.classList.remove("succeeded")
//             element.classList.add("failed")
//         }
//     });


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
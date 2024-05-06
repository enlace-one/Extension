////////////////
// Page Notes //
////////////////
displayFullTable = true
thoroughSearch = true

// //////////////////
// // GOOGLE DRVIE //
// //////////////////

// const folderName = "Enlace"
// let folderId = null
// let referencesFolderId = null
// let googleToken = null

// // On page load, check if the user is signed in
// chrome.identity.getAuthToken({interactive: false}, async function(token) {
//     if (chrome.runtime.lastError) {
//         // Handle error - for example, by showing a sign-in prompt to the user
//         console.log(chrome.runtime.lastError.message);
//         return;
//       }
//     if (token) {
//         googleToken = token
//         folderId = await createFolderIfNotExists(token, folderName)
//         referencesFolderId = await createFolderIfNotExists(token, "References", folderId)
//         document.getElementById("sign-in-button").classList.add("hidden")
//         document.getElementById("sign-out-button").classList.remove("hidden")
//         document.getElementById("drive-sign-in-display").innerText = "Signed in"
//     }
// });

// // sign-out-button
// document.getElementById("sign-out-button").addEventListener("click", function() {
//     chrome.identity.removeCachedAuthToken({token: googleToken}, function() {
//         googleToken = null
//         document.getElementById("drive-sign-in-display").innerText = "Signed out"
//         document.getElementById("sign-in-button").classList.remove("hidden")
//         document.getElementById("sign-out-button").classList.add("hidden")
//     });
// });

// // sign-in-button
// window.onload = function() {
//     document.querySelector('#sign-in-button').addEventListener('click', async function() {
//       chrome.identity.getAuthToken({interactive: true}, async function(token) {
//         if (chrome.runtime.lastError) {
//             // Handle error - for example, by showing a sign-in prompt to the user
//             console.log(chrome.runtime.lastError.message);
//             showNotification("Sign in failed.")
//             return;
//           }
//         googleToken = token
//         if (token) {
//             showNotification("Signed in")
//             folderId = await createFolderIfNotExists(token, folderName)
//             referencesFolderId = await createFolderIfNotExists(token, "References", folderId)
//             document.getElementById("sign-in-button").classList.add("hidden")
//             document.getElementById("drive-sign-in-display").innerText = "Signed in"
//             document.getElementById("sign-out-button").classList.remove("hidden")
//         } else {
//             showNotification("Sign in failed")
//         }
//       });
//     });
//   };

//   async function createFolder(token, name, parentFolderId = null) {
//     // Folder metadata
//     const folderMetadata = {
//         'name' : name,
//         'mimeType' : 'application/vnd.google-apps.folder',
//     };

//     if (parentFolderId) {
//         folderMetadata['parents'] = [parentFolderId];
//     }

//     // Create the fetch options
//     const options = {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(folderMetadata)
//     };

//     // Send the request
//     return fetch('https://www.googleapis.com/drive/v3/files', options)
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             return data.id;
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             return null;
//         });
// }

// async function searchFolder(token, folderName, parentFolderId = null) {
//     // Returns folder ID 
//     // Search for the folder
//     const searchOptions = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         }
//     };

//     let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
//     if (parentFolderId) {
//         query += ` and '${parentFolderId}' in parents`;
//     }

//     const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, searchOptions);
//     const searchData = await searchResponse.json();

//     // If the folder does not exist, create it
//     if (searchData.files.length === 0) {
//         return false;
//     } else {
//        return searchData.files[0].id;
//     }
// }

// async function createFolderIfNotExists(token, folderName, parentFolderId = null) {
//     // Returns folder ID 
//     // Search for the folder
//     folderId = await searchFolder(token, folderName, parentFolderId)
//     if (folderId){
//         return folderId
//     } else {
//         return createFolder(token, folderName, parentFolderId)
//     }
// }

// async function createFile(token, folderId, fileName, fileData) {
//     console.log(token);

//     // File data to be uploaded
//     const blobData = new Blob([fileData], { type: 'text/plain' });

//     // File metadata
//     const fileMetadata = {
//         'name': fileName, // Replace with your file name
//         'parents': [folderId],
//         'mimeType': 'text/plain'
//     };

//     // Create new FormData instance
//     let formData = new FormData();

//     // Add the metadata and file data to the form
//     formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
//     formData.append('file', blobData);

//     // Create the fetch options
//     const options = {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         },
//         body: formData
//     };

//     // Send the request
//     fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', options)
//         .then(response => response.json())
//         .then(data => console.log(data))
//         .catch(error => console.error('Error:', error));
// }

// async function updateFile(token, fileId, fileData) {
//     // File data to be uploaded
//     const blobData = new Blob([fileData], { type: 'text/plain' });

//     // Create new FormData instance
//     let formData = new FormData();

//     // Add the metadata and file data to the form
//     formData.append('file', blobData);

//     // Create the fetch options
//     const options = {
//         method: 'PATCH',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         },
//         body: formData
//     };

//     // Send the request
//     fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, options)
//         .then(response => response.json())
//         .then(data => console.log(data))
//         .catch(error => console.error('Error:', error));

// }

// async function listFiles(token, folderId) {
//     // Create the fetch options
//     const options = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         }
//     };

//     // Send the request
//     return fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents`, options)
//         .then(response => response.json())
//         .then(data => {
//             if (data.files) {
//                 return data.files;
//             } else {
//                 return [];
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             return [];
//         });
// }


// async function searchFile(token, folderId, fileName) {
//     // Returns file id or null if not found
//     // Create the fetch options
//     const options = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         }
//     };

//     // Send the request
//     return fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+name='${fileName}'`, options)
//         .then(response => response.json())
//         .then(data => {
//             if (data.files && data.files.length > 0) {
//                 return data.files[0].id;
//             } else {
//                 return null;
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             return null;
//         });
// }
// async function getFile(token, fileId) {
//     // Returns file data as a blob
//     // Create the fetch options
//     const options = {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         }
//     };

//     // Send the request
//     return fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, options)
//         .then(response => response.blob())
//         .then(blob => {
//             return blob;
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             return null;
//         });
// }

// async function searchAndGetFile(token, folderId, fileName) {
//     // Returns file data as a blob
//     // Search for the file
//     const fileId = await searchFile(token, folderId, fileName);
//     if (fileId) {
//         const blob = await getFile(token, fileId);

//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onloadend = function() {
//                 resolve(reader.result);
//             }
//             reader.onerror = reject;
//             reader.readAsText(blob);
//         });
//     } else {
//         return null;
//     }
// }

// async function createFileIfNotExists(token, folderId, fileName) {
//     // Returns file ID
//     // Search for the file
//     const file = await searchFile(token, folderId, fileName);
//     if (file) {
//         return file.id;
//     } else {
//         return await createFile(token, folderId, fileName, "").id;
//     }
// }

// ////////////////
// // REFERENCES //
// ////////////////
// /* <h2>References</h2>
// <!--A searchable list of "references" files that can be opened easily-->
// <div id="references-list">
//     <input type="text" id="references-search" placeholder="Search references">
//     <ul id="references-ul">
//     </ul>
// </div>
// <div id="references-display">
//     <h3 id="references-title"></h3>
//     <div class="hidden" id="references-edit-buttons">
//         <button id="references-edit">Edit</button>
//         <button id="references-save">Save</button>
//     </div>
//     <div id="references-content">
//         <textarea id="references-text" style="width:80vw; height: 80vh;" readonly>

//         </textarea>
//     </div>
// </div> */

// let ref_files = ["css_selectors.txt", "regex.txt", "bash.txt", "chrome_keyboard.txt", "git.txt", "country_codes.txt", "linux_keyboard.txt", "linux_term.txt", "nmap.txt", "powershell.txt", "sql.txt", "us_states.txt", "windows_cmd.txt", "windows_keyboard.txt"]
// // Opens the local References folder and creates a new Google Drive file for each if they don't exist
// async function updateDrive() {
//     for (let file of ref_files) {
//         if (googleToken) {
//             fileId = await searchFile(googleToken, referencesFolderId, file)
//             if (!fileId) {
//                 fetch("references/" + file)
//                 .then(response => response.text())
//                 .then(data => {
//                     createFile(googleToken, referencesFolderId, file, data)
//                 })
//             }
//         }
//     }
// }

// // On reference tab open, update ref_files
// document.querySelector('.referencesName[data-tab="references-tab"]').addEventListener('click', async function() {
//     await updateDrive()
//     if (googleToken) {
//         for (file of await listFiles(googleToken, referencesFolderId)) {
//             if (!ref_files.includes(file.name))  {
//                 ref_files.push(file.name)
//             }
//         }
//     }
//     openRefFile(await getSetting("last-open-ref-file") || "css_selectors.txt")
// });

// async function openRefFile(name, newFile = false) {
//     document.getElementById("references-ul").innerHTML = ""
//     document.getElementById("references-text").value = ""
//     document.getElementById("references-title").innerText = ""
//     showNotification("Opening " + name)
//     if (googleToken) {
//         const file = await searchAndGetFile(googleToken, referencesFolderId, name)
//         if (file) {
//             document.getElementById("references-title").innerText = name
//             document.getElementById("references-text").value = file
//         }
//         document.getElementById("references-edit-buttons").classList.remove("hidden")
//     } else {
//         fetch("references/" + name)
//             .then(response => response.text())
//             .then(data => {
//                 document.getElementById("references-title").innerText = name
//                 document.getElementById("references-text").value = data
//             })
//     }
//     if (newFile) {
//         document.getElementById("references-title").innerText = name
//     }
//     storeSetting("last-open-ref-file", name)
// }

// document.getElementById("references-edit").addEventListener("click", function() {
//     const refText = document.getElementById("references-text")
//     refText.readOnly = false
//     refText.focus()
// });

// document.getElementById("references-save").addEventListener("click", function() {
//     const refText = document.getElementById("references-text")
//     refText.readOnly = true
//     if (googleToken) {
//         fileId = createFileIfNotExists(googleToken, referencesFolderId, document.getElementById("references-title").innerText)
//         updateFile(googleToken, referencesFolderId, fileId, refText.value)
//     }
// });

// document.getElementById("references-new").addEventListener("click", async function() {
//     const name = prompt("Enter the name of the new reference file")
//     if (name) {
//         const fileId = await searchFile(googleToken, referencesFolderId, name)
//         if (fileId) {
//             console.log(fileId)
//             showNotification("File already exists")
//         } else {
//             await createFileIfNotExists(googleToken, referencesFolderId, name)
//             ref_files.push(name)
//             await openRefFile(name, newFile = true);
//         }
//     }
// });


// // Search for references
// async function search_references() {
//     const search = document.getElementById("references-search").value
//     const ul = document.getElementById("references-ul")
//     ul.innerHTML = ""
//     ref_files.sort()
//     ref_files.forEach(file => {
//         if (file.includes(search)) {
//             const li = document.createElement("li");
//             li.innerText = file;
//             //li.style.color = 'blue'; // Change the text color to blue
//             li.style.fontStyle = "bold"
//             li.style.backgroundColor = "lightblue";
//             li.style.fontSize = '14px'; // Change the font size to 18px
//             li.style.padding = '5px'; // Add some padding
//             li.style.marginRight = '0px'; // Add some margin
//             li.style.border = '1px solid black'; // Add a border
//             li.style.width = '40vw';
//             li.style.listStyleType = 'none'; // Remove the list item bullet
//             li.addEventListener("click", async function() {
//                 openRefFile(file);
//             });
//             ul.appendChild(li);
//         }
//     })
// }

// document.getElementById("references-search").addEventListener("click", async function() {
//     search_references()
// })
// document.getElementById("references-search").addEventListener("input", async function() {
//     search_references()
// })

// // When lose focus, clear the search results
// document.getElementById("references-search").addEventListener('blur', function() {
//     setTimeout(async function() {
//         document.getElementById("references-ul").innerHTML = "";
//     }, 2000);
// });


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

        try {
            var snippetsBytes = JSON.stringify(result["snippet-data"]).length * 2; // Multiply by 2 to account for UTF-16 encoding
            document.getElementById("snippets-space").innerText = snippetsBytes
        } catch (error) {
            console.log("No snippets found")
        }
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

document.getElementById("reset-page-note-config").addEventListener("click", function () {
    pageNoteJson.value = JSON.stringify(defaultPageNoteConfig, null, 4)
    store("page-note-json", defaultPageNoteConfig)
    showNotification("Saved")
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

document.getElementById("reset-snippets").addEventListener("click", function (){
    store("snippet-data", {})
})

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
// // When this is clicked: <button class="tab-button scriptName" data-tab="script-tab">
// document.querySelector('.scriptName[data-tab="script-tab"]').addEventListener("click", async function() {
//     try {
//         const script = await get("script")
//     } catch {
//         // Nothing
//     }
//     // fetch script.js file and set content as value of script-editor
//     fetch("script.js").then(response => response.text()).then(data => {
//         document.getElementById('script-editor').value = data
//     })
// });

// document.getElementById("script-editor").addEventListener("input", function() {
//     // Get content from the editor
//     const editorContent = document.getElementById('script-editor').value;

//     // Save content to chrome.storage
//     store("script", editorContent)
// });


document.addEventListener("DOMContentLoaded", function() {
    // If # in url, then get the value of it 
    if (window.location.hash) {
        var hashValue = window.location.hash.substring(1); // Removes the '#' from the beginning
        console.log("hash:", hashValue)
        document.getElementById("page-notes-super-tab").click()
        open_page_note(hashValue)
    }

});


document.getElementById("delete-expired-page-note-button").addEventListener("click", function () {
    showNotification("Deleted expired page notes")
})
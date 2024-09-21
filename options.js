
function changeTabs(button) {
    return function() {
        const tabButtons = document.querySelectorAll(".tab-button");
        // Remove 'active' class from all tab buttons
        tabButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        // Add 'active' class to the clicked tab button
        button.classList.add("active");

        // Get the ID of the tab to show
        const dataTabClass = button.getAttribute("data-tab");

        // Hide all tab contents
        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach(function (content) {
            content.classList.remove("active");
        });

        // Show the tab content with the corresponding ID
        const tabContentToShow = document.getElementsByClassName(dataTabClass);
        const tabContentArray = Array.from(tabContentToShow);

        // Iterate over each element and add the "active" class
        tabContentArray.forEach(element => {
            element.classList.add("active");
        });
    };
}




//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    

})














////////////////
// Page Notes //
////////////////


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


// Open Page Note from sidepanel
// document.addEventListener("DOMContentLoaded", function() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const paramName = "pageNote"; 
//     if (urlParams.has(paramName)) {
//         var paramValue = urlParams.get(paramName);
//         console.log("Parameter value:", paramValue);
//         document.getElementById("page-notes-super-tab").click();
//         open_page_note(paramValue);
//     }
// });

// Create a function to open the sidebar and add "?page=KeyboardShortcuts" to the url 
// function openSidePanelToKeyBoardShortcuts () {
//     chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//         chrome.sidePanel.open({ tabId: tab.id });

//         setTimeout(function() {
//             try {
//                 chrome.runtime.sendMessage({
//                     type: 'open-key-board-shortcuts',
//                     target: 'sidepanel',
//                     data: true
//                 });
//             } catch (e) {
//                 console.log("failed to open keyboard shortcuts", e)
//             }
//         }, 100)
//     });
// }


// document.addEventListener("keydown", function(event) {
//     if (event.ctrlKey && event.key === "?") {
//         console.log("opening side panel")
//         openSidePanelToKeyBoardShortcuts()
//     }
// })


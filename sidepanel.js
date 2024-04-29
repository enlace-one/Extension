// To check if sidepanel is open or closed
chrome.runtime.connect({ name: 'mySidepanel' });

////////////////
// Page notes //
////////////////
// // Disabled for not so I can re-engineer with webmde

// // Add a listener for the context menu item
// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//     if (info.menuItemId === "add-to-page-note") {
//         const selection = info.selectionText;
//         document.getElementById("page-notes-textarea").value += "\n" + selection;
//         storeKeyValue();
//         document.getElementById("page-notes-unsaved-changes").classList.add("hidden")
//         document.getElementById("page-notes-saved-changes").classList.remove("hidden")
//     }
// });

// let saveTimeout;
// document.getElementById('page-notes-textarea').addEventListener('keydown', function(event) {
//     clearTimeout(saveTimeout); // Clear the existing timeout on every key press
//     document.getElementById("page-notes-saved-changes").classList.add("hidden")
//     document.getElementById("page-notes-unsaved-changes").classList.remove("hidden")
//     saveTimeout = setTimeout(() => {
//         storeKeyValue();
//         document.getElementById("page-notes-unsaved-changes").classList.add("hidden");
//         document.getElementById("page-notes-saved-changes").classList.remove("hidden");
//     }, 3000); // Set a new timeout
// });

// document.getElementById('page-notes-textarea').addEventListener('keydown', function(event) {
//      if (event.altKey && event.key === 't') {
//         event.preventDefault()
//         let currentDate = new Date();
//         let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
//         let formattedDate = currentDate.toLocaleString('en-GB', options);
//         this.value += formattedDate;
//     } else if (event.ctrlKey && event.key === 's') {
//         event.preventDefault()
//         storeKeyValue();
//         document.getElementById("page-notes-unsaved-changes").classList.add("hidden");
//         document.getElementById("page-notes-saved-changes").classList.remove("hidden");
//         saveTimeout = ""
//     }  
// });

// // document.getElementById('page-notes-textarea').addEventListener('change', function(event) {
// //     document.getElementById("page-notes-saved-changes").classList.add("hidden")
// //     document.getElementById("page-notes-unsaved-changes").classList.remove("hidden")
// // });

// document.getElementById('url-pattern').addEventListener('keydown', function(event) {
//     if (event.key === "Enter") {
//       storeKeyValue();
//     }
// });


// async function storeKeyValue() {
//     const key = document.getElementById("url-pattern").value
//     const value = document.getElementById("page-notes-textarea").value
//     if (key && value) {
//         if (key.length > await getSetting("max-key-char-page-notes")) {
//             showNotification("Url is too long")
//             return ""
//         } else if (value.length > await getSetting("max-value-char-page-notes")) {
//             showNotification("Note is too long")
//             return ""
//         } else {
//             if (await getSetting("encrypt-page-notes")) {
//                 // data[key] = encrypt(value)
//                 storePageNoteData(key, encrypt(value))
//             } else {
//                 // data[key] = value;
//                 storePageNoteData(key, value)
//             }
//             // store("page-note-data", data)
//             showNotification("Saved")
//         }
//     } else {
//         showNotification("Provide a url and note")
//     }
// }

// function defaultPattern(url) {
//     if (url === undefined) {
//         url = ""
//     }
//     if (url.includes("?")) {
//         url = url.split("?")[0]
//     }
//     if (url.includes("#")) {
//         url = url.split("#")[0]
//     }
//     const escapedString = escapeRegExp(url);
//     console.log("returning " + escapedString)
//     return escapedString
// }

// async function checkMatch(url, isPattern=false) {
//     const result = await searchPageNoteData(url, isPattern=isPattern)
//     const key = result[0]
//     const value = result[1]
//     if (await getSetting("encrypt-page-notes")) {
//         return [key, decrypt(value)]; // Return the corresponding value
//     } else {
//         return [key, value]; // Return the corresponding value
//     }
// }

// let data = {};
// get("page-note-data").then((value) => {
//     data = value || {};
//   });


// document.addEventListener("DOMContentLoaded", async function () {
//     // Convert old page notes to new storage method
//     async function convertPageNotes(data) {
//         for (const key in data) {
//             if (! await get(key)) {
//                 console.log("Converting page note " + key + " to new storage method")
//                 storePageNoteData(key, data[key]);
//             }
//         }
//     }
//     convertPageNotes(data);
// });



// // Get Page Note Data 
// async function getPageNoteData(key) {
//     return get("page-note-data-" + key)
// }

// // Set Page Note Data
// async function storePageNoteData(key, value) {
//     store("page-note-data-" + key, value)
// }

// // Remove Page Not Data
// async function removePageNoteData(key) {
//     chrome.storage.sync.remove("page-note-data-" + key)
// }

// // Search Page Note Data
// async function searchPageNoteData(searchKey, isPattern=true) {
//     results = await chrome.storage.sync.get()
//     for (result in results) {
//         if (result.startsWith("page-note-data-")) {
//             if (! isPattern) {
//                  // If the searchKey is a pattern just like the 
//                  // stored key, then it would just be an ==.
//                  const regexPattern = new RegExp(result.substring(15));
//                  if (regexPattern.test(searchKey)) {
//                     return [result.substring(15), results[result]]
//                 }
//             } else {
//                 if (searchKey == result.substring(15)) {
//                     return [result.substring(15), results[result]]
//                 }
//             }
            
//         }
//     }
//     return [defaultPattern(searchKey), ""]
// }


// async function setActiveURL(url, isPattern=false) {
//     keyTextArray = await checkMatch(url, isPattern=isPattern)
//     console.log(keyTextArray)
//     document.getElementById("url-pattern").value = keyTextArray[0]
//     document.getElementById("page-notes-textarea").value = keyTextArray[1]
// }

// let changeWithTabs = true

// document.getElementById("page-notes-toggle-change").addEventListener("click", function () {
//     changeWithTabs = document.getElementById("page-notes-toggle-change").checked
// });

// document.addEventListener("DOMContentLoaded", async function () {
//     const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
//     console.log(tab.url)
//     setActiveURL(tab.url);
//   });
  
//   chrome.tabs.onActivated.addListener(async (activeInfo) => {
//     if (changeWithTabs) {
//         const tab = await chrome.tabs.get(activeInfo.tabId);
//         if (tab.active) {
//         console.log("======= active tab url", tab.url);
//         setActiveURL(tab.url);
//         }
//     }
//   });
  
//   chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//     if (changeWithTabs) {
//         if (tab.active) {
//         console.log("======= updated tab url", tab.url);
//         setActiveURL(tab.url);
//         }
//     }
//   });


///////////////////////
// Page Notes Search //
///////////////////////
// // Disabled for not so I can re-engineer with webmde
// const searchResults = document.getElementById("page-notes-search-results")
// const searchBox = document.getElementById("page-notes-search")
// const resultTable = document.getElementById("page-notes-result-table")

// searchBox.addEventListener("keyup", async function () {
//     const searchKey = searchBox.value
//     let matches = []
//     if (! await getSetting("encrypt-page-notes")) {
//         results = await chrome.storage.sync.get()
//         for (result in results) {
//             if (result.startsWith("page-note-data-")) {
//                 if (result.includes(searchKey) | results[result].includes(searchKey)) {
//                     matches.push(result.substring(15))
//                 }  
//             }
//         }
//     } else {
//         results = await chrome.storage.sync.get()
//         for (result in results) {
//             if (result.startsWith("page-note-data-")) {
//                 if (result.includes(searchKey)) {
//                     matches.push(result)
//                 }  
//             }
//         }
//     }
//     resultTable.innerHTML = ""
//     if (matches.length > 0) {
//         highlightedIndex = 0;
//         const tableBody = document.createElement('tbody');
//         matches.forEach(async (match, index) => {
//           const row = tableBody.insertRow();
//           row.style="border-radius: 5px;"
//           const keyCell = row.insertCell();
//           const valueCell = row.insertCell();
//           const deleteCell = row.insertCell();
//           keyCell.textContent = truncateText(match, 20) + ":";
//           keyCell.classList.add("bold")
//           keyCell.classList.add("page-note-result")
//           //keyCell.attributes.add("key", match)
//           keyCell.setAttribute("key", match)
//           keyCell.addEventListener("click", function () {
//             console.log("Opening page note")
//             changeTabs(document.getElementById("page-notes-tab-button"))()
//             setActiveURL(this.getAttribute("key"), isPattern=true);
//             //document.getElementById("url-pattern").value=
//           })
//           keyCell.id = match
//           if (await getSetting("encrypt-page-notes")) {
//                 valueCell.textContent = truncateText(decrypt(await getPageNoteData(match)), 10);
//             } else {
//                 valueCell.textContent = truncateText(await getPageNoteData(match), 10);
//             }
//           valueCell.style="width: 60vw;"
//           valueCell.classList.add("truncate")
//           deleteCell.textContent = "X"
//           //deleteCell.attributes.add("key_id", match)
//           deleteCell.addEventListener("click", function () {
//              removePageNoteData(match);
//              //  store("page-note-data", data)
//              row.remove()
//              showNotification("Deleted" + match)
//           })
//           if (index === highlightedIndex) {
//             row.classList.add('highlighted');
//           }
//         });
//         resultTable.appendChild(tableBody);
        
//       } else {
//         resultTable.textContent = `No matches found for '${searchKey}'.`;
//       }
// });

/////////////
// Easymde //
/////////////

// https://github.com/Ionaru/easy-markdown-editor?tab=readme-ov-file#install-easymde
async function initializeEditor() {
    const easyMDE = new EasyMDE(
        {
            element: document.getElementById('page-notes-textarea'), 
            unorderedListStyle: "-",
            shortcuts: {
                togglePreview: "Alt-P"
            },
            autofocus: true,
            autosave: {
                enabled: true,
                delay: 1000,
                uniqueId: "enlace_markdown_editor",
                timeFormat: {
                    locale: 'en-US',
                    format: {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    },
                },
                text: "Autosaved: "
            },
        }
    );
}
initializeEditor();

// GET
//easyMDE.value();

// SET
// easyMDE.value('New input for **EasyMDE**');


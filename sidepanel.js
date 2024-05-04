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

function get_default_pattern(url) {
    if (url === undefined) {
        url = ""
    }
    if (url.includes("?")) {
        url = url.split("?")[0]
    }
    if (url.includes("#")) {
        url = url.split("#")[0]
    }
    const escapedString = escapeRegExp(url);
    console.log("returning " + escapedString)
    return escapedString
}

function get_default_title(url) {
    let title = ""
    if (url === undefined) {
        title = ""
    } else {
        try {
            title = url.split("/")[2]
        } catch {
            console.log(`Failed to get domain from ${url}`)
        }
    }
    return title
}

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

const easyMDE = new EasyMDE(
    {
        element: document.getElementById('page-notes-textarea'), 
        unorderedListStyle: "-",
        shortcuts: {
            togglePreview: "Alt-P"
        },
        autofocus: true,
        toolbar: ["bold", "italic", "heading", "code", "quote", "unordered-list", "ordered-list", "clean-block", "link", "image", "preview", "side-by-side", "fullscreen", "guide", "horizontal-rule", "table"]
        // autosave: {
        //     enabled: true,
        //     delay: 1000,
        //     uniqueId: uniqueId,
        //     timeFormat: {
        //         locale: 'en-US',
        //         format: {
        //             year: 'numeric',
        //             month: 'long',
        //             day: '2-digit',
        //             hour: '2-digit',
        //             minute: '2-digit',
        //         },
        //     },
        //     text: "Autosaved: "
        // },
    }
);



// Architecture
// UniqueID : Page Note
// URL : UniqueID
// Title : UniqueID

// GET
//easyMDE.value();

// SET
// easyMDE.value('New input for **EasyMDE**');

//////////////
// ELEMENTS //
//////////////

const urlPatternElement = document.getElementById("url-pattern");
const titleElement = document.getElementById("page-notes-title");
const idElement = document.getElementById("page-note-id");
const pageNotesTabButton = document.getElementById("page-notes-tab-button")

let encryptPageNotes = false
getSetting("encrypt-page-notes").then((value) => {
    encryptPageNotes = value
})

let displayFullTable = false
let thoroughSearch = false

//////////
// SAVE //
//////////

async function _save_page_note(id, note, title, url_pattern) {
    if (encryptPageNotes) {
        note = await encrypt(note)
    } 
    const noteData = {
        note: note,
        title: title,
        url_pattern: url_pattern,
        id: id
    };
    store(id, noteData)
    console.log(`Note saved with ID: ${id}`);
}

async function save_page_note() {
    const url = urlPatternElement.value;
    const title = titleElement.value;
    const id = idElement.value;
    const note = await easyMDE.value();
    _save_page_note(id, note, title, url)
    showNotification("Saved")
}

let saveTimeout;

easyMDE.codemirror.on("change", () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        save_page_note();
    }, 1500); // 2000 milliseconds = 2 seconds
});

/////////
// GET //
/////////

async function get_page_note(id) {
    page_note = await get(id)
    if (encryptPageNotes) {
        page_note.note = await decrypt(page_note.note)
    } 
    return page_note
}

async function open_page_note(id) {
    console.log(`Opening page note ${id}`)

    const page_note = await get_page_note(id)

    console.log(page_note)

    easyMDE.value(page_note.note);
    urlPatternElement.value = page_note.url_pattern;
    titleElement.value = page_note.title;
    idElement.value = id;
    pageNotesTabButton.classList.remove("hidden");
    pageNotesTabButton.click();
    
}

////////////
// DELETE //
////////////

async function delete_page_note(id) {
    await chrome.storage.sync.remove(id)
}

////////////
// SEARCH //
////////////

async function _search_page_note(term) {
    const filteredNotes = [];
    const lowerCaseTerm = term.toLowerCase();

    const results = await chrome.storage.sync.get();
    for (let key in results) {
        let note = results[key];
        if (key.startsWith("mde_")) {
            if (note.title.toLowerCase().includes(lowerCaseTerm)) {
                filteredNotes.push(note);
            } else if (thoroughSearch) {
                if (note.url_pattern.toLowerCase().includes(lowerCaseTerm)) {
                    filteredNotes.push(note);
                } else if (! encryptPageNotes) {
                    if (note.note.toLowerCase().includes(lowerCaseTerm)) {
                        filteredNotes.push(note);
                    }
                }
            }
        }
    }
    return filteredNotes;
}


async function search_page_notes() {
    const term = document.getElementById("page-notes-search").value;
    const table = document.getElementById("page-notes-result-table");
    table.innerHTML = "";

    const page_notes = await _search_page_note(term); 
    console.log("Searched. Page notes returned ", page_notes.length)
    
    makePageNoteTable(page_notes, table)
    
}

document.getElementById("page-notes-search").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action to avoid any unwanted behavior (like form submission)
        search_page_notes();
    }
});

////////////////////
// AUTO MATCH URL //
////////////////////

async function get_matching_page_notes(url) {
    const matchingNotes = [];

    const results = await chrome.storage.sync.get()
    for (key in results) {
        let result = results[key]
        if (key.startsWith("mde_")) {
            if (new RegExp(result.url_pattern).test(url)) {
                result["id"] = key
                matchingNotes.push(result);
            }
        }
    }

    // for (const id in notes) {
    //     const note = notes[id];
    //     // Assuming url_pattern in note is a regex or specific string to match URLs
    //     if (new RegExp(note.url_pattern).test(url)) {
    //         matchingNotes.push(note);
    //     }
    // }

    return matchingNotes;
}

// Search for matching page note to current url 
// If found:
    // put matching page notes in search tab
    // If one, then open it in page note tab and unhide the tab. 

async function makePageNoteTable(page_notes, table){
    if (displayFullTable && ! encryptPageNotes) {
        table.innerHTML = "<tr><th>Title</th><th>Pattern</th><th>Note</th><th></th></tr>"; 
    } else if (encryptPageNotes) {
        table.innerHTML = "<tr><th>Title</th><th>Pattern</th><th></th></tr>"; 
    } else {
        table.innerHTML = "<tr><th>Title</th><th>Note</th><th></th></tr>"; 
    }
    page_notes.forEach((note, index) => {
        const row = table.insertRow();
        const titleCell = row.insertCell();

        if (!encryptPageNotes) {
            const noteCell = row.insertCell();
            noteCell.textContent = truncateText(note.note, 20);
        }
        if (encryptPageNotes || displayFullTable) {
            const urlCell = row.insertCell();
            urlCell.textContent = truncateText(note.url_pattern, 20);
        } 

        const delCell = row.insertCell();

        titleCell.textContent = note.title;
        delCell.textContent = "Delete"
        delCell.classList.add("onHoverChange")

        titleCell.addEventListener("click", function() {
            open_page_note(note.id)
            
        })
        delCell.addEventListener("click", function() {
            delete_page_note(note.id)
            row.remove()
        }) 
    });

};

async function setActiveURL(url) {
    const table = document.getElementById("page-notes-matching-url-table");
    table.innerHTML = "";

    document.getElementById("page-notes-indicator").innerText = "";
    const page_notes = await get_matching_page_notes(url); 
    console.log("Searched. Page notes returned ", page_notes.length)
    if (page_notes.length > 0) { 
        document.getElementById("page-notes-indicator").innerText = "(" + page_notes.length + ")";
        makePageNoteTable(page_notes, table)
    }

    if (page_notes.length === 1 &&  pageNotesTabButton.classList.contains("hidden")) {
        open_page_note(page_notes[0].id)
    }
}

async function getCurrentURL() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab.url
}

document.addEventListener("DOMContentLoaded", async function () {
    url = await getCurrentURL()
    console.log("======= dom tab url", url)
    setActiveURL(url);
});
        
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.active) {
        console.log("======= active tab url", tab.url);
        setActiveURL(tab.url);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
        console.log("======= updated tab url", tab.url);
        setActiveURL(tab.url);
    }
});

////////////////////
// NEW PAGE NOTES //
////////////////////

// When new is clicked 
    // Put default url pattern
    // Put default title

async function get_current_url() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab.url;
}

async function newPageNote() {
    console.log("Generating new page note")
    const url = await get_current_url()
    const url_pattern = await get_default_pattern(url)
    const title = await get_default_title(url)

    const id = "mde_" +  await generateRandomAlphaNumeric(8)

    // TODO: CHECK IF TITLE IN ALREADY SAVED PAGENOTES!

    urlPatternElement.value = url_pattern
    titleElement.value = title
    easyMDE.value("")
    idElement.value = id
    pageNotesTabButton.classList.remove("hidden")
    document.getElementById("new-page-notes-tab-button").classList.remove("active")
    pageNotesTabButton.classList.add("active")
}

document.getElementById("new-page-notes-tab-button").addEventListener("click", newPageNote)

/////////////////////////
// Additional Features //
/////////////////////////

function insertTextAtCursor(text) {
    const pos = easyMDE.codemirror.getCursor();
    easyMDE.codemirror.setSelection(pos, pos);
    easyMDE.codemirror.replaceSelection(text);
    // easyMDE.codemirror.setCursor(pos + text.length)
}

document.querySelector(".EasyMDEContainer").addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.key === ';') {
        console.log("Adding current date/time")
       event.preventDefault()
       let currentDate = new Date();
       let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
       let formattedDate = currentDate.toLocaleString('en-GB', options);
        insertTextAtCursor(formattedDate);
   } else if (event.ctrlKey && event.key === 'u') {
        console.log("Adding current url")
        let url = await getCurrentURL()
        url = "[title](" + url + ")"
        insertTextAtCursor(url);
   }
});
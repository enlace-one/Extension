// Houses common functions for both sidepanel.js and options.js 


function insertTextAtCursor(text) {
    const pos = easyMDE.codemirror.getCursor();
    easyMDE.codemirror.setSelection(pos, pos);
    easyMDE.codemirror.replaceSelection(text);
    // Move the cursor to the end of the inserted text
    easyMDE.codemirror.setCursor({line: pos.line, ch: pos.ch + text.length});
    
}


////////////////
// Page notes //
////////////////

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

/////////////
// Easymde //
/////////////

// https://github.com/Ionaru/easy-markdown-editor?tab=readme-ov-file#install-easymde

const easyMDE = new EasyMDE(
    {
        element: document.getElementById('page-notes-textarea'), 
        ...defaultPageNoteConfig
    }
);

//////////////
// ELEMENTS //
//////////////

const urlPatternElement = document.getElementById("url-pattern");
const titleElement = document.getElementById("page-notes-title");
const idElement = document.getElementById("page-note-id");
const pageNotesTabButton = document.getElementById("page-notes-tab-button")
const savedAtIndicator = document. querySelector(".autosave")//getElementById("page-notes-saved-at")

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

async function savedAtBanner() {
    savedAtIndicator.innerText = "Saved."
    setTimeout(function() {
        savedAtIndicator.innerText = ""
    }, 1000)
}

async function save_page_note() {
    const url = urlPatternElement.value;
    const title = titleElement.value;
    const id = idElement.value;
    const note = await easyMDE.value();
    _save_page_note(id, note, title, url)
    savedAtBanner()
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
    easyMDE.codemirror.refresh()
    
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

    if (page_notes.length > 0) {
        document.getElementById("no-search-results-page-notes").classList.add("hidden")
        makePageNoteTable(page_notes, table)
    } else {
        document.getElementById("no-search-results-page-notes").classList.remove("hidden")
    }    
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

        if (encryptPageNotes || displayFullTable) {
            const urlCell = row.insertCell();
            urlCell.textContent = truncateText(note.url_pattern, 20);
        } 

        if (!encryptPageNotes) {
            const noteCell = row.insertCell();
            noteCell.textContent = truncateText(note.note, 20);
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

document.querySelector(".EasyMDEContainer").addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.key === ';') {
        console.log("Adding current date/time")
        event.preventDefault()
        let currentDate = new Date();
        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        let formattedDate = currentDate.toLocaleString('en-GB', options);
        insertTextAtCursor(formattedDate);
   } else if (event.ctrlKey && event.key === ':') {
        event.preventDefault()
        console.log("Adding current url");
        let url = await getCurrentURL()
        url = "[title](" + url + ")";
        insertTextAtCursor(url);
   }
});
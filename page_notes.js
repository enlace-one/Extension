///////////////////////
// Naming Convention //
///////////////////////
// 
//
// CSS 
// All IDs/Classes begin with: page-notes
//
// JavaScript
// All Global function/variables begin with: pn
//

///////////////
// Variables //
///////////////


let pnSaveButton;
let pnEditor;
let pnURLField;
let pnCreatedTimestampSpan;
let pnUpdatedTimestampSpan;
let pnTitleField;
let pnOpenNoteButton;
let pnSearchTable;
let pnSearchInput;
let pnNewPageNoteButton;
let pnURLPatternField;
let pnSavedNoteStatusField;
let pnOpenURLField;
let currentTabId;
let pnEditorDiv;

let pnCurrentGoogleId;
let pnCurrentPageNoteId

let pnSummaryFileId;
const pnSummaryFileName = "page_notes_summary"

const pnQueryParam = "PageNoteGoogleId"


///////////////
// Functions //
///////////////

// quill.getContents(); // Gets in quill format
// quill.getText(); // gets text
// quill.getSemanticHTML(); // Gets in HTML
// quill.setContents(delta) 
// quill.setText(text)

async function getCurrentTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' '); // e.g., "2024-09-21 12:34:56"
}



async function pnUpdateTimestamp() {
    pnUpdatedTimestampSpan.innerText = await getCurrentTimestamp()
}

async function pnGetCurrentPageNote() {
    currentPageNote = {
        "quill_contents": pnEditor.getContents(),
        "id": pnCurrentPageNoteId,
        "google_id": pnCurrentGoogleId,
        "updated_time": pnUpdatedTimestampSpan.innerText,
        "created_time": pnCreatedTimestampSpan.innerText,
        "url": pnURLField.value,
        "url_pattern": pnURLPatternField.value,
        "title": pnTitleField.value
    }
    return currentPageNote
}

async function pnSetCurrentPageNote(pageNote) {
    pnEditor.setContent(pageNote.quill_contents)
    pnCurrentPageNoteId = pageNote.id
    pnUpdatedTimestampSpan.innerText = pageNote.updated_time
    pnCreatedTimestampSpan.innerText = pageNote.created_time
    pnURLField.value = pageNote.url 
    pnCurrentGoogleId = pageNote.google_id
    pnTitleField = pageNote.title
    pnURLPatternField = pageNote?.url_pattern
}

async function pnGetSummaryFileId() {
    if (!pnSummaryFileId) {
        console.log("Page Notes summary file ID not in memory, searching..")
        pnSummaryFileId = await gdSearchFile(pnSummaryFileName);
        if (!pnSummaryFileId) {
            console.log("Page Notes summary file id not found in Google, making")
            // Create the summary data with the current note if no file exists
            const pndata = {};
            const summaryFileData = JSON.stringify(pndata);
            pnSummaryFileId = await gdCreateFile(pnSummaryFileName, summaryFileData);
            console.log("Created summary file");
        }
    }
    return pnSummaryFileId
}

async function pnSaveNoteDataInSummaryFile(pageNote) {
    // Step 1: Remove 'quill_contents' from the pageNote
    const { quill_contents, ...filteredPageNote } = pageNote;

    // Step 3: Retrieve the existing notes from the summary file
    const existingNotes = await gdGetFileJSON(pnSummaryFileId)
    
    // Step 4: Add or update the pageNote in the list
    existingNotes[filteredPageNote.id] = filteredPageNote;

    // Step 5: Save the updated list back to the summary file
    const updatedSummaryData = JSON.stringify(existingNotes);
    await gdUpdateFile(pnSummaryFileId, updatedSummaryData);
    console.log("Added data to summary file");
}


async function pnSaveNoteData(pageNote) {
    // Output the pageNote dict as a JSON string

    console.log("Saving note", pageNote)

    // Check if ID is defined, if not create ID using the current time
    if (!pageNote.id) {
        showNotification("Creating page note, please wait...", 10)

        pageNote.id = "page_note_" + Date.now().toString(); // Create a unique ID based on the current timestamp
        pnCurrentPageNoteId = pageNote.id

        pageNote.created_time = await getCurrentTimestamp()
        pnCreatedTimestampSpan.innerText = pageNote.created_time

        const fileData = JSON.stringify(pageNote);

        console.log("File Data:", fileData)

        // Call createGoogleFile with the ID as filename and the JSON data
        pnCurrentGoogleId = await gdCreateFile(pageNote.id, fileData);

        console.log("Newly created pagenote GoogleId: ", pnCurrentGoogleId)

        // Save in summary file
        pageNote.google_id = pnCurrentGoogleId
        await pnSaveNoteDataInSummaryFile(pageNote)

        

        setTimeout(function () {
            // location = "?PageNoteGoogleId=" + pageNotesGoogleId
            addQueryParamAndHash(pnQueryParam, pnCurrentGoogleId, "page-notes")
        }, 3000)

        return pnCurrentGoogleId
    } else {
        const fileData = JSON.stringify(pageNote);

        await gdUpdateFile(pageNote.google_id, fileData)

        await pnSaveNoteDataInSummaryFile(pageNote)

        showNotification("Page Note Saved");
        pnSetStatusSaved()

        return pageNote.google_id
    }
    
}

async function pnSaveNote() {
    await pnUpdateTimestamp();
    const pageNote = await pnGetCurrentPageNote();
    if (pageNote.title) {
        await pnSaveNoteData(pageNote);
    } else {
        showNotification("You must set the title before you can save the note", 6)
    }
    
}


// async function pageNotesGetNoteData(googleID) {
//     try {
//         const file = await getGoogleFile(googleID); // Fetch the file using the provided ID
//         const fileData = await file.text(); // Get the file content as text
        
//         // Parse and return the dictionary from the JSON string
//         return JSON.parse(fileData);
//     } catch (error) {
//         console.error('Error retrieving note data:', error);
//         throw error; // Rethrow the error for further handling if necessary
//     }
// }
async function pnDeletePageNote(googleID) {
    // Prompt for confirmation
    if (await confirm("Are you sure you want to delete the note?")) {
        const success = await gdDeleteFile(googleID);

        if (success) {
            // Retrieve existing notes and remove the note
            const existingNotes = await gdGetFileJSON(pnSummaryFileId);
            delete existingNotes[googleID];  // Use delete to remove the note by ID

            // Update the summary file with the modified notes
            const updatedSummaryData = JSON.stringify(existingNotes);
            await gdUpdateFile(pnSummaryFileId, updatedSummaryData);

            showNotification("Successfully deleted note");

            // Hide the row corresponding to the deleted note
            const row = document.getElementById(googleID);
            if (row) {
                row.classList.add("hidden");
            }
        } else {
            showNotification("Error deleting note");
        }
    }
}


async function pnPopulateOpenNotesTable() {

    const pns = await gdGetFileJSON(pnSummaryFileId);

    // Clear existing rows
    pnSearchTable.innerHTML = `<tr>
                    <th>Title</th>
                    <th>URL</th>
                    <th class="hide-on-small-screens">Updated</th>
                    <th>Created</th>
                    <th class="hide-on-small-screens">Delete</th>
                </tr>`;

    const sortedPns = Object.values(pns).sort((a, b) => new Date(b.updated_time) - new Date(a.updated_time));

    Object.values(sortedPns).forEach(pn => {
        const row = document.createElement("tr"); // Changed 'row' to 'tr'
        row.id = pn.google_id

        const tdTitle = document.createElement("td");
        const tdUrl = document.createElement("td");
        const tdUpdated = document.createElement("td");
        const tdCreated = document.createElement("td");
        const tdDelete = document.createElement("td");

        tdUpdated.classList.add("hide-on-small-screens")
        tdDelete.classList.add("hide-on-small-screens")

        tdTitle.addEventListener("click", function () {
            addQueryParamAndHash(pnQueryParam, pn.google_id, "page-notes");
        });
        tdTitle.classList.add("blue-text")
        tdTitle.innerText = truncateText(pn.title, getTruncateCharLength());
        if (!pn.google_id) {
            tdTitle.innerText = "!Err: " + tdTitle.innerText
        }
        tdTitle.setAttribute('data-full-text',  pn.title)

        tdUrl.innerText = truncateText(pn.url, getTruncateCharLength());
        tdUrl.setAttribute('data-full-text',pn.url)
        tdUpdated.innerText = pn.updated_time.split(' ')[0];
        tdCreated.innerText = pn.created_time.split(' ')[0]; // Fixed assignment
        tdDelete.innerText = "X"; // Add delete functionality here

        tdDelete.addEventListener("click", function () {
            pnDeletePageNote(pn.google_id)
        })

        row.append(tdTitle);
        row.append(tdUrl);
        row.append(tdUpdated);
        row.append(tdCreated);
        row.append(tdDelete);

        pnSearchTable.append(row);
    });
}


async function pnSearchPageNotes() {
    const searchTerm = pnSearchInput.value.toLowerCase();
    const rows = pnSearchTable.querySelectorAll('tr');

    rows.forEach((row, index) => {
        // Skip the header row
        if (index === 0) return;

        const title = row.querySelector('td:first-child').getAttribute('data-full-text').toLowerCase();
        const url = row.querySelector('td:nth-child(2)').getAttribute('data-full-text').toLowerCase();

        if (title.includes(searchTerm) || url.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

async function pnSetStatusSaved() {
    // pnSavedNoteStatusField.classList  = ["saved"]
    // pnSavedNoteStatusField.innerText = "Saved."
    pnSavedNoteStatusField.classList.remove("orange-ball")
}
async function pnSetStatusUnsaved() {
    // pnSavedNoteStatusField.classList  = ["unsaved"]
    // pnSavedNoteStatusField.innerText = "Unsaved"
    pnSavedNoteStatusField.classList.add("orange-ball")
}

async function pnNewPageNote() {
    showNotification("Opening new note...", 3)
    pnSetStatusUnsaved()
    
    // Clear
    pnEditor.deleteText(0, 99999999);
    pnCreatedTimestampSpan.innerText = ""
    pnUpdatedTimestampSpan.innerText = ""
    pnCurrentPageNoteId = ""
    pnCurrentGoogleId = null
    pnTitleField.value = ""
    pnURLField.value = ""
    pnURLPatternField.value = ""
}

async function pnOpenPageNote (pageNoteGoogleId) {
    showNotification("Loading...")
    pageNote = await gdGetFileJSON(pageNoteGoogleId) 

    pnEditor.setContents(pageNote.quill_contents)
    pnCreatedTimestampSpan.innerText = pageNote.created_time
    pnUpdatedTimestampSpan.innerText = pageNote.updated_time
    pnCurrentPageNoteId = pageNote.id
    // Recall that after first creation the google is not in the pn
    // Also there is an 's' in the global one
    pnCurrentGoogleId = pageNoteGoogleId 
    pnTitleField.value = pageNote.title
    pnURLField.value = pageNote.url
    pnURLPatternField.value = pageNote.url_pattern

    pnSetStatusSaved()
}

async function pnGetPageNoteFromURL() {
      console.log("Searching for page note in URL")
      const params = new URLSearchParams(window.location.search);
      
      if (params.has('PageNoteGoogleId')) {
        console.log("Page note found in url:", params.get(pnQueryParam))
        if (params.get(pnQueryParam) != "undefined") {
            return pnOpenPageNote(params.get(pnQueryParam))
        } else {
            console.error("Page note in URL is undefined")
        }
      } else {
        return null
      }
}

function pnOpenURL() {
    const url = pnURLField.value;

    if (url) {
        chrome.sidePanel.open({ tabId: currentTabId });

        setTimeout(function() {
            try {
                chrome.runtime.sendMessage({
                    type: "open-page-note",
                    target: 'sidepanel',
                    data: pnCurrentGoogleId
                });
            } catch (e) {
                console.log("failed to open keyboard shortcuts", e)
            }
        }, 100)
    
        // Open the URL in a new tab
        window.open(url, '_blank');
        
    } else {
        
        showNotification('URL Field is empty')
    }
}

///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {
    pnGetSummaryFileId().then(id=>
        pnGetPageNoteFromURL().then(id=>
            pnPopulateOpenNotesTable()
        )
    )
})


//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    pnSaveButton = document.getElementById("page-notes-save")
    pnURLField = document.getElementById("page-notes-url")
    pnURLPatternField = document.getElementById("page-notes-url-pattern")
    pnCreatedTimestampSpan = document.getElementById("page-notes-created-timestamp")
    pnUpdatedTimestampSpan = document.getElementById("page-notes-updated-timestamp")
    pnTitleField = document.getElementById("page-notes-title")
    pnOpenNoteButton = document.getElementById("page-notes-open")
    pageNotesOpenTabButton = document.querySelector("[data-tab='page-notes-open-tab']");
    pnSearchTable = document.getElementById("page-notes-table")
    pnSearchInput = document.getElementById("page-notes-search")
    pnNewPageNoteButton = document.getElementById("page-notes-new")
    pnSavedNoteStatusField = document.getElementById("page-notes-saved-status")
    pnOpenURLField = document.getElementById("page-notes-open-url")
    pnEditorDiv = document.getElementById("page-notes-editor")

    pnEditorDiv.addEventListener("keydown", function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();  // Prevent default behavior (if necessary)
            pnSaveNote();     // Call the function
        }
    });
    

    chrome.tabs.query({ active: true, currentWindow: true },([tab]) => {
        currentTabId = tab.id})

    pnEditor = new Quill('#page-notes-editor', {
        theme: 'snow'
    });

    pnOpenURLField.addEventListener("click", pnOpenURL)

    pnSaveButton.addEventListener("click", pnSaveNote)

    pnOpenNoteButton.addEventListener("click", function () {
        pageNotesOpenTabButton.click()
        pnSearchInput.focus()
    })

    pnSearchInput.addEventListener("input", pnSearchPageNotes)

    pnNewPageNoteButton.addEventListener("click", pnNewPageNote)

    pnURLField.addEventListener("input", pnSetStatusUnsaved)
    pnURLPatternField.addEventListener("input", pnSetStatusUnsaved)
    pnTitleField.addEventListener("input", pnSetStatusUnsaved)
    // pageNotesEditor.addEventListener("input", pageNotesSetStatusUnsaved)
    pnEditor.on('text-change', pnSetStatusUnsaved);

})


////////////////////////
// DOMContentModified //
////////////////////////

// // Uncomment the below to add stuff after initial DOM Changes occur. It's a custom event. 
// document.addEventListener("DOMContentModified", function() {
    
// })

/////////////////
// tabsChanged //
/////////////////

// // Uncomment the below to add stuff after the URL changes. It's a custom event.
// document.addEventListener('tabsChanged', async (event) => {
//     const tab = event.detail.tab;
// })
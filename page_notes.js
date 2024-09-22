// CSS prefix: page-notes
// JS prefix: pageNotes

///////////////
// Variables //
///////////////


let pageNotesSaveButton;
let pageNotesEditor;
let pageNotesURLField;
let pageNotesCreatedTimestampSpan;
let pageNotesUpdatedTimestampSpan;
let pageNotesIdSpan;
let pageNotesTitleField;
let pageNotesOpenNoteButton;
let pageNotesSearchTable;
let pageNotesSearchInput;
let pageNotesNewPageNoteButton;

let pageNotesGoogleID;

let pageNotesSummaryFileId;
let pageNotesSummaryFileName = "page_notes_summary"


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



async function pageNotesUpdateTimestamp() {
    pageNotesUpdatedTimestampSpan.innerText = await getCurrentTimestamp()
}

async function pageNotesGetCurrent() {
    currentPageNote = {
        "quill_contents": pageNotesEditor.getContents(),
        "id": pageNotesIdSpan.innerText,
        "google_id": pageNotesGoogleID,
        "updated_time": pageNotesUpdatedTimestampSpan.innerText,
        "created_time": pageNotesCreatedTimestampSpan.innerText,
        "url": pageNotesURLField.value,
        "title": pageNotesTitleField.value
    }
    return currentPageNote
}

async function pageNotesSetCurrent(pageNote) {
    pageNotesEditor.setContent(pageNote.quill_contents)
    pageNotesIdSpan.innerText = pageNote.id
    pageNotesUpdatedTimestampSpan.innerText = pageNote.updated_time
    pageNotesCreatedTimestampSpan.innerText = pageNote.created_time
    pageNotesURLField.value = pageNote.url 
    pageNotesGoogleID = pageNote.google_id
    pageNotesTitleField = pageNote.title
}

async function pageNotesGetSummaryFileId() {
    if (!pageNotesSummaryFileId) {
        console.log("Page Notes summary file ID not in memory, searching..")
        pageNotesSummaryFileId = await searchGoogleFile(pageNotesSummaryFileName);
        if (!pageNotesSummaryFileId) {
            console.log("Page Notes summary file id not found in Google, making")
            // Create the summary data with the current note if no file exists
            const pndata = {};
            const summaryFileData = JSON.stringify(pndata);
            pageNotesSummaryFileId = await createGoogleFile(pageNotesSummaryFileName, summaryFileData);
            console.log("Created summary file");
        }
    }
    return pageNotesSummaryFileId
}

async function pageNotesSaveNoteDataInSummaryFile(pageNote) {
    // Step 1: Remove 'quill_contents' from the pageNote
    const { quill_contents, ...filteredPageNote } = pageNote;

    // Step 3: Retrieve the existing notes from the summary file
    const existingNotes = await getGoogleFileJSON(pageNotesSummaryFileId)
    
    // Step 4: Add or update the pageNote in the list
    existingNotes[filteredPageNote.id] = filteredPageNote;

    // Step 5: Save the updated list back to the summary file
    const updatedSummaryData = JSON.stringify(existingNotes);
    await updateGoogleFile(pageNotesSummaryFileId, updatedSummaryData);
    console.log("Added data to summary file");
}


async function pageNotesSaveNoteData(pageNote) {
    // Output the pageNote dict as a JSON string

    console.log("Saving note", pageNote)

    // Check if ID is defined, if not create ID using the current time
    if (!pageNote.id) {
        pageNote.id = "page_note_" + Date.now().toString(); // Create a unique ID based on the current timestamp
        pageNotesIdSpan.innerText = pageNote.id

        pageNote.created_time = await getCurrentTimestamp()
        pageNotesCreatedTimestampSpan.innerText = pageNote.created_time

        const fileData = JSON.stringify(pageNote);

        console.log("File Data:", fileData)

        // Call createGoogleFile with the ID as filename and the JSON data
        pageNotesGoogleID = await createGoogleFile(pageNote.id, fileData);

        // Save in summary file
        pageNote.google_id = pageNotesGoogleID
        await pageNotesSaveNoteDataInSummaryFile(pageNote)

        return pageNotesGoogleID
    } else {
        const fileData = JSON.stringify(pageNote);

        await updateGoogleFile(pageNote.google_id, fileData)

        await pageNotesSaveNoteDataInSummaryFile(pageNote)

        return pageNote.google_id
    }
    
}

async function pageNotesSaveNote() {
    await pageNotesUpdateTimestamp();
    const pageNote = await pageNotesGetCurrent();
    await pageNotesSaveNoteData(pageNote);
    showNotification("Page Note Saved");
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
async function pageNotesDeletePageNote(googleID) {
    // Prompt for confirmation
    if (await confirm("Are you sure you want to delete the note?")) {
        const success = await deleteGoogleFile(googleID);

        if (success) {
            // Retrieve existing notes and remove the note
            const existingNotes = await getGoogleFileJSON(pageNotesSummaryFileId);
            delete existingNotes[googleID];  // Use delete to remove the note by ID

            // Update the summary file with the modified notes
            const updatedSummaryData = JSON.stringify(existingNotes);
            await updateGoogleFile(pageNotesSummaryFileId, updatedSummaryData);

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


async function pageNotesPopulateOpenNotesTable() {

    const pns = await getGoogleFileJSON(pageNotesSummaryFileId);

    // Clear existing rows
    pageNotesSearchTable.innerHTML = `<tr>
                    <th>Title</th>
                    <th>URL</th>
                    <th>Updated</th>
                    <th>Created</th>
                    <th>Delete</th>
                </tr>`;

    Object.values(pns).forEach(pn => {
        const row = document.createElement("tr"); // Changed 'row' to 'tr'
        row.id = pn.google_id

        const tdTitle = document.createElement("td");
        const tdUrl = document.createElement("td");
        const tdUpdated = document.createElement("td");
        const tdCreated = document.createElement("td");
        const tdDelete = document.createElement("td");

        tdTitle.innerText = truncateText(pn.title, 50);
        tdUrl.innerText = truncateText(pn.url, 50);
        tdUpdated.innerText = pn.updated_time.split(' ')[0];
        tdCreated.innerText = pn.created_time.split(' ')[0]; // Fixed assignment
        tdDelete.innerText = "X"; // Add delete functionality here

        tdDelete.addEventListener("click", function () {
            pageNotesDeletePageNote(pn.google_id)
        })

        row.append(tdTitle);
        row.append(tdUrl);
        row.append(tdUpdated);
        row.append(tdCreated);
        row.append(tdDelete);

        pageNotesSearchTable.append(row);
    });
}


async function pageNotesSearchPageNotes() {
    const searchTerm = pageNotesSearchInput.value.toLowerCase();
    const rows = pageNotesSearchTable.querySelectorAll('tr');

    rows.forEach((row, index) => {
        // Skip the header row
        if (index === 0) return;

        const title = row.querySelector('td:first-child').innerText.toLowerCase();
        const url = row.querySelector('td:nth-child(2)').innerText.toLowerCase();

        if (title.includes(searchTerm) || url.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

async function pageNotesNewPageNote() {
    showNotification("Opening new note...", 3)
    
    // Clear
    pageNotesEditor.deleteText(0, 99999999);
    pageNotesCreatedTimestampSpan.innerText = ""
    pageNotesUpdatedTimestampSpan.innerText = ""
    pageNotesIdSpan.innerText = ""
    pageNotesGoogleID = null
    pageNotesTitleField.value = ""
    pageNotesURLField.value = ""

}


///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {
    pageNotesGetSummaryFileId();
    
})

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    pageNotesSaveButton = document.getElementById("page-notes-save")
    pageNotesURLField = document.getElementById("page-notes-url")
    pageNotesCreatedTimestampSpan = document.getElementById("page-notes-created-timestamp")
    pageNotesUpdatedTimestampSpan = document.getElementById("page-notes-updated-timestamp")
    pageNotesIdSpan = document.getElementById("page-notes-id");
    pageNotesTitleField = document.getElementById("page-notes-title")
    pageNotesOpenNoteButton = document.getElementById("page-notes-open")
    pageNotesOpenTabButton = document.querySelector("[data-tab='page-notes-open-tab']");
    pageNotesSearchTable = document.getElementById("page-notes-table")
    pageNotesSearchInput = document.getElementById("page-notes-search")
    pageNotesNewPageNoteButton = document.getElementById("page-notes-new")

    pageNotesEditor = new Quill('#page-notes-editor', {
        theme: 'snow'
    });

    pageNotesSaveButton.addEventListener("click", pageNotesSaveNote)

    pageNotesOpenNoteButton.addEventListener("click", function () {
        pageNotesOpenTabButton.click()
        pageNotesPopulateOpenNotesTable()
    })

    pageNotesSearchInput.addEventListener("input", pageNotesSearchPageNotes)

    pageNotesNewPageNoteButton.addEventListener("click", pageNotesNewPageNote)

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
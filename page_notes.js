// CSS prefix: page-notes
// JS prefix: pageNotes

///////////////
// Variables //
///////////////

let pageNotesSaveButton;
let pageNotesEditor;
let pageNotesURLField;
let pageNotesCreatedTimestamp;
let pageNotesUpdatedTimestamp;
let pageNotesID;
let pageNotesGoogleID;


///////////////
// Functions //
///////////////

// quill.getContents(); // Gets in quill format
// quill.getText(); // gets text
// quill.getSemanticHTML(); // Gets in HTML
// quill.setContents(delta) 
// quill.setText(text)

async function pageNotesGetCurrent() {
    currentPageNote = {
        "quill_contents": pageNotesEditor.getContents(),
        "id": pageNotesID.value,
        "google_id": pageNotesGoogleID,
        "updated_time": pageNotesUpdatedTimestamp.value,
        "created_time": pageNotesCreatedTimestamp.value,
        "url": pageNotesURLField.value,
        "title": "" // Keeping for possible use
    }
    return currentPageNote
}

async function pageNotesSetCurrent(pageNote) {
    pageNotesEditor.setContent(pageNote.quill_contents)
    pageNotesID.value = pageNote.id
    pageNotesUpdatedTimestamp.value = pageNote.updated_time
    pageNotesCreatedTimestamp.value = pageNote.created_time
    pageNotesURLField.value = pageNote.url 
    pageNotesGoogleID = pageNote.google_id
}

async function pageNotesSaveNoteData(pageNote) {
    // Output the pageNote dict as a JSON string
    const fileData = JSON.stringify(pageNote);

    // Check if ID is defined, if not create ID using the current time
    if (!pageNote.id) {
        pageNote.id = "page_note_" + Date.now().toString(); // Create a unique ID based on the current timestamp
        
        // Call createGoogleFile with the ID as filename and the JSON data
        await createGoogleFile(pageNote.id, fileData);

        return pageNote.id
    } else {
        await updateGoogleFile(pageNote.google_id, fileData)

        return pageNote.id
    }
    
}

async function pageNotesGetNoteData(id) {
    try {
        const file = await getGoogleFile(id); // Fetch the file using the provided ID
        const fileData = await file.text(); // Get the file content as text
        
        // Parse and return the dictionary from the JSON string
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Error retrieving note data:', error);
        throw error; // Rethrow the error for further handling if necessary
    }
}


///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {
    
})

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    pageNotesSaveButton = document.getElementById("page-notes-save")
    pageNotesURLField = document.getElementById("page-notes-url")
    pageNotesCreatedTimestamp = document.getElementById("page-notes-created-timestamp")
    pageNotesUpdatedTimestamp = document.getElementById("page-notes-updated-timestamp")
    pageNotesID = document.getElementById("page-notes-id");

    pageNotesEditor = new Quill('#page-notes-editor', {
        theme: 'snow'
    });
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
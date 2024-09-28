


//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {

})


///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {

    // Default to page notes when signed in 
    const contactNotesTabButton = document.querySelector("[data-tab='contact-notes-tab']")
    const pageNotesTabButton = document.querySelector("[data-tab='page-notes-tab']")
    const aboutTabButton = document.querySelector("[data-tab='about-tab']")

    const params = new URLSearchParams(window.location.search);
    
    if (window.location.hash === '#contact-notes' ) {
        contactNotesTabButton.click();
    } else if (window.location.hash === '#page-notes') {
        pageNotesTabButton.click();
    } else if (window.location.hash === '#about' ) {
        aboutTabButton.click()
    } else if (params.get("ContactGoogleId")) {
        contactNotesTabButton.click();
    } else if (params.get("PageNoteGoogleId")) {
        pageNotesTabButton.click()
    }
    // || params.get("ContactGoogleId") || params.get("PageNoteGoogleId")
    pageNotesTabButton.classList.remove("hidden")
    contactNotesTabButton.classList.remove("hidden")
})

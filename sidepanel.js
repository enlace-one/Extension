// To check if sidepanel is open or closed
// chrome.runtime.connect({ name: 'mySidepanel' });

///////////////
// Page Notes//
///////////////

const pnHelpButton = document.getElementById("page-notes-help-tab-button")

async function setActiveURL(url) {
    const table = document.getElementById("page-notes-matching-url-table");
    table.innerHTML = "";

    document.getElementById("page-notes-indicator").innerText = "";
    const page_notes = await get_matching_page_notes(url); 
    console.log("Searched. Page notes returned ", page_notes.length)
    if (page_notes.length > 0) { 
        document.getElementById("no-matching-page-notes").classList.add("hidden")
        document.getElementById("page-notes-indicator").innerText = "(" + page_notes.length + ")";
        makePageNoteTable(page_notes, table)
    } else {
        document.getElementById("no-matching-page-notes").classList.remove("hidden")
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

document.getElementById("add-current-url").addEventListener("click", async function () {
    const url = await get_current_url()
    let url_pattern = await get_default_pattern(url)
    url_pattern = url_pattern.substring(0, maxPageNotesURLChar);
    url_pattern = urlPatternElement.value + "|" + url_pattern
    urlPatternElement.value = url_pattern
})

document.getElementById("add-current-domain").addEventListener("click", async function () {
    const url = await get_current_url()
    let domain = await get_default_title(url)
    let url_pattern = await get_default_pattern(domain)
    url_pattern = url_pattern.substring(0, maxPageNotesURLChar);
    url_pattern = urlPatternElement.value + "|" + url_pattern
    urlPatternElement.value = url_pattern
})

//////////////////////////////////
// Open this in the options page//
//////////////////////////////////

// document.getElementById("open-page-note-in-options").addEventListener("click", async function() {
//     const pageNoteId = idElement.value
//     const url = await chrome.runtime.getURL('options.html') + '#' + pageNoteId;
//     chrome.tabs.create({ url: url });

// });

async function quickEdit() {
    const previewIsActive = easyMDE.isPreviewActive();
    if (previewIsActive) {
        easyMDE.togglePreview();
    }
    easyMDE.codemirror.focus();
    save_page_note();
    easyMDE.codemirror.focus();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request, sender) 
        if (request.type === "open-side-panel") {
            quickEdit();
        }
});


document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "?") {
        console.log("Help button clicked")
        pnHelpButton.click()
        if (easyMDE.isFullscreenActive()){
            easyMDE.toggleFullScreen
        }
        for (const [key, value] of Object.entries(pageNoteConfigOverwrite["shortcuts"])) {
            const element = document.getElementById("kbs_" + key);
            if (element) {
                element.innerText = value;
            } else {
                console.log(`Element with ID ${key} not found.`);
            }
        }
    }
})
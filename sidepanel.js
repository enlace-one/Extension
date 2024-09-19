async function getCurrentURL() {
    try {
      // Query the active tab in the last focused window
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  
      // Check if the tab exists and has a valid URL
      if (!tab || !tab.url) {
        console.log("No active tab or tab URL found");
        return "undefined";
      }
  
      let url = tab.url;
  
      // Check for special or invalid URLs
      const invalidUrls = ["about:blank", "chrome://newtab/"];
      if (invalidUrls.includes(url)) {
        console.log("Invalid or non-standard tab URL found");
        return "undefined";
      }
  
      // Strip trailing slash if it exists
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
  
      return url;
    } catch (error) {
      // Log any unexpected errors
      console.error("Error retrieving current URL:", error);
      return "undefined";
    }
  }
  

////////////////
// Page Notes //
////////////////

var pnHelpButton;

async function setActiveURL(url, autoOpen = false) {
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


    if (page_notes.length === 1 && pageNotesTabButton.classList.contains("hidden") && autoOpen) {
        open_page_note(page_notes[0].id, inPreview = true)
    }
    // Sidepanel would have to be in focus... 
    // else {
    //     setTimeout(function () {
    //         document.getElementById("page-notes-search").click()
    //         document.getElementById("page-notes-search").focus()
    //     }, 1000)
    // } 
}

async function updatePageNoteURL() {
    url = await getCurrentURL()
    console.log("Url:", url)
    setActiveURL(url, autoOpen = true);
}


///////////////////////////////////
// Open this in the options page //
///////////////////////////////////


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
    function (request, sender, sendResponse) {
        console.log(request, sender)
        if (request.type === "open-side-panel") {
            quickEdit();
        } else if (request.type === "open-key-board-shortcuts") {
            openKeyBoardShortcuts()
        }
    });

function openKeyBoardShortcuts() {
    console.log("Help button clicked")
    pnHelpButton.click()
    if (easyMDE.isFullscreenActive()) {
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


document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "?") {
        openKeyBoardShortcuts()
    }
})

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {

    ////////////////////////////////
    // Change Visible Tab Buttons //
    ////////////////////////////////
    const switchButtons = document.querySelectorAll(".switch-button")
    const regexSearchTabButton = document.getElementById("regex-search-tab-button")
    const group1 = document.querySelector(".group1")
    const group2 = document.querySelector(".group2")

    switchButtons.forEach(async function (button) {
        button.addEventListener("click", async function () {
            if (button.classList.contains("group1")) {
                group1.classList.add("hidden")
                group2.classList.remove("hidden")
                regexSearchTabButton.click()
            } else {
                group2.classList.add("hidden")
                group1.classList.remove("hidden")
                openPageNoteButton.click()
            }
        })
    })

    ////////////////
    // Page Notes //
    ////////////////

    urlPatternElement = document.getElementById("url-pattern");
    titleElement = document.getElementById("page-notes-title");
    idElement = document.getElementById("page-note-id");
    pageNotesTabButton = document.getElementById("page-notes-tab-button");
    newPageNotesTabButton = document.getElementById("new-page-notes-tab-button")
    openPageNoteButton = document.getElementById(
    "open-page-notes-tab-button"
    );
    pageNotesSearchInput = document.getElementById("page-notes-search");
    recentPageNotesTable = document.getElementById("recent-page-notes-table");
    recentPageNotesNoneFound = document.getElementById("recent-page-notes")
    pnHelpButton = document.getElementById("page-notes-help-tab-button")

    titleElement.addEventListener("change", saveNoteTimeOut);
    urlPatternElement.addEventListener("change", saveNoteTimeOut);

    pageNotesSearchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action to avoid any unwanted behavior (like form submission)
        search_page_notes();
        }
    });

    newPageNotesTabButton.addEventListener("click", newPageNote);

    // Focus on search when clicking "open"
    openPageNoteButton.addEventListener(
        "click",
        function () {
        setTimeout(function () {
            pageNotesSearchInput.focus();
        }, 50)
        }
    );

    // Focus on page note when clicking "page note"
    pageNotesTabButton.addEventListener("click",
        function () {
        setTimeout(function () {
            easyMDE.codemirror.focus();
        }, 50)
        })


    document.getElementById("add-current-url").addEventListener("click", async function () {
        const url = await getCurrentURL()
        let url_pattern = await get_default_pattern(url)
        url_pattern = url_pattern.substring(0, maxPageNotesURLChar - 1);
        url_pattern = urlPatternElement.value + "|" + url_pattern
        urlPatternElement.value = url_pattern
    })
    
    document.getElementById("add-current-domain").addEventListener("click", async function () {
        const url = await getCurrentURL()
        let domain = await get_default_title(url)
        let url_pattern = await get_default_pattern(domain)
        url_pattern = url_pattern.substring(0, maxPageNotesURLChar - 1);
        url_pattern = urlPatternElement.value + "|" + url_pattern
        urlPatternElement.value = url_pattern
    })
    
    getRecentPageNotes()
    updatePageNoteURL()

})


////////////////////////
// DOMContentModified //
////////////////////////

// // Uncomment the below to add stuff after initial DOM Changes occur. It's a custom event. 
// window.addEventListener("DOMContentModified", function() {
    
// })

/////////////////
// tabsChanged //
/////////////////

document.addEventListener('tabsChanged', async (event) => {

    ////////////////
    // Page Notes //
    ////////////////

    updatePageNoteURL()

});
// To check if sidepanel is open or closed
// chrome.runtime.connect({ name: 'mySidepanel' });

///////////////
// Page Notes//
///////////////

const pnHelpButton = document.getElementById("page-notes-help-tab-button")

async function setActiveURL(url, autoOpen=false) {
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
        open_page_note(page_notes[0].id, inPreview=true)
    } 
    // Sidepanel would have to be in focus... 
    // else {
    //     setTimeout(function () {
    //         document.getElementById("page-notes-search").click()
    //         document.getElementById("page-notes-search").focus()
    //     }, 1000)
    // } 
}


document.addEventListener("DOMContentLoaded", async function () {
    url = await getCurrentURL()
    console.log("======= dom tab url", url)
    setActiveURL(url, autoOpen=true);
});
        
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.active) {
        url = await getCurrentURL()
        console.log("======= active tab url", tab.url);
        setActiveURL(url);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
        url = await getCurrentURL()
        console.log("======= updated tab url", tab.url);
        setActiveURL(url);
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
        } else if (request.type === "open-key-board-shortcuts") {
            openKeyBoardShortcuts()
        }
});

function openKeyBoardShortcuts() {
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


document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "?") {
        openKeyBoardShortcuts()
    }
})


///////////////////////
// REGEX PAGE SEARCH //
///////////////////////

function highlightPatternMatches(regexInput) {
    console.log("Regex search running")
    const regex = new RegExp(regexInput, 'gi');
    const bodyText = document.body.innerHTML;
    
    
    // // Clear previous highlights
    // document.body.innerHTML = document.body.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');

    let match;
    let matchesFound = 0;
    let highlightedText = bodyText;
    let matches = [];
    
    while ((match = regex.exec(bodyText)) !== null) {
        matchesFound++;
        // const highlightedMatch = `<span class="highlight">${match[0]}</span>`;
        // highlightedText = highlightedText.replace(match[0], highlightedMatch);
        matches.add(match[0])
    }
    // document.body.innerHTML = "<style>.highlight {background-color: yellow; font-weight: bold;}</style>" + highlightedText;
    return matches
}

document.getElementById('regex-search').addEventListener('keydown', async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        console.log("searching regex")
        
        const regexInput = document.getElementById('regex-search').value;
        const resultsContainer = document.getElementById('regex-search-results');
        let matches;
        
        // chrome.scripting.executeScript({
        //     target: {tabId: tab.id},
        //     function: highlightPatternMatches,
        //     args: [regexInput]
        // })

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        matches = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: highlightPatternMatches,
            args: [regexInput]
        })
        console.log("matches", matches)

        for (const match of matches) {
            resultsContainer.value = resultsContainer.value + match.innerText
            console.log(match, match.innerHTML)
        }

        

        // Display results
        // resultsContainer.innerHTML = `Found ${matchesFound} match(es)`;
    }
});



// EDGE SPECIFIC
if (navigator.userAgent.includes("Edge")) {
    // Zoom in/out since not supported in Edge
    // Add event listener to detect key presses
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey) {
        if (event.key === '+') {
            // Zoom in logic
            document.body.style.zoom = parseFloat(getComputedStyle(document.body).zoom) + 0.1;
            console.log("in")
        } else if (event.key === '-') {
            // Zoom out logic
            document.body.style.zoom = parseFloat(getComputedStyle(document.body).zoom) - 0.1;
            console.log("out")
        }
        }
    });
}



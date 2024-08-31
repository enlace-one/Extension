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
    url_pattern = url_pattern.substring(0, maxPageNotesURLChar-1);
    url_pattern = urlPatternElement.value + "|" + url_pattern
    urlPatternElement.value = url_pattern
})

document.getElementById("add-current-domain").addEventListener("click", async function () {
    const url = await get_current_url()
    let domain = await get_default_title(url)
    let url_pattern = await get_default_pattern(domain)
    url_pattern = url_pattern.substring(0, maxPageNotesURLChar-1);
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


// function highlightPatternMatches(regexInput) {
//     let marks = []; 
//     let matched_text = [];

//     function findMatchAndRecurse(element, regex) {
//         if (element.childNodes.length > 0) {
//             for (var i = 0; i < element.childNodes.length; i++) {
//                 findMatchAndRecurse(element.childNodes[i], regex);
//             }
//         }

//         var str = element.nodeValue;

//         if (str == null) {
//             // console.log(`${element} has no text -- Search for ${regex}`)
//             return;
//         }

//         var matches = str.match(regex);
//         // var parent = element.parentNode;

//         if (matches !== null) {
//             // console.log(`${element} HAS A MATCH -- Search for ${regex}`)
//             // // for match in matches
//             // for (var i = 0; i < matches.length; i++) {
                
//             // }

//             const parent = element.parentNode;
//                 const originalText = element.nodeValue;
//                 let pos = 0;
//                 let mark;

//                 for (let i = 0; i < matches.length; i++) {
//                     const { match, index } = matches[i];

//                     const before = document.createTextNode(originalText.substring(pos, index));
//                     pos = index + match.length;

//                     if (element.parentNode === parent) {
//                         parent.replaceChild(before, element);
//                     } else {
//                         parent.insertBefore(before, mark.nextSibling);
//                     }

//                     mark = document.createElement('mark');
//                     mark.appendChild(document.createTextNode(match));
//                     parent.insertBefore(mark, before.nextSibling);
//                     marks.push(mark);
//                 }

//                 const after = document.createTextNode(originalText.substring(pos));
//                 parent.insertBefore(after, mark.nextSibling);

//             // var pos = 0;
//             // var mark;
//             // for (var i = 0; i < matches.length; i++) {
//             //     var index = str.indexOf(matches[i], pos);
//             //     var before = document.createTextNode(str.substring(pos, index));
//             //     pos = index + matches[i].length;

//             //     if (element.parentNode == parent) {
//             //         parent.replaceChild(before, element);
//             //     } else {
//             //         parent.insertBefore(before, mark.nextSibling);
//             //     }

//             //     mark = document.createElement('mark');
//             //     mark.appendChild(document.createTextNode(matches[i]));
//             //     parent.insertBefore(mark, before.nextSibling);
//             //     marks.push(mark);
//             // }
//             // var after = document.createTextNode(str.substring(pos));
//             // parent.insertBefore(after, mark.nextSibling);
//         } else {
//             // console.log(`${element} has no match -- Search for ${regex}`)
//         }
//     }

//     console.log(`Regex search running for regex "${regexInput}"`);
//     const regex = new RegExp(regexInput, 'gi');
//     const body = document.body;

//     findMatchAndRecurse(body, regex);

//     return marks.length;
// }

function highlightPatternMatches(regexInput, inclusiveSearch=false) {
    function clearPreviousMarks() {
        const marks = document.querySelectorAll('mark');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize(); // Combine adjacent text nodes
        });
    }
    function isVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
    
        // Check if the element is visible and not covered up by other elements
        if (inclusiveSearch) {
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0'
            );
        } else {return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element === document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        );}
    }
    

    clearPreviousMarks(); // Clear any previous highlights

    let matches = [];

    function findMatchAndRecurse(element, regex) {
        if (element.childNodes.length > 0) {
            for (let i = 0; i < element.childNodes.length; i++) {
                findMatchAndRecurse(element.childNodes[i], regex);
            }
        }

        if (element.nodeType === Node.TEXT_NODE && isVisible(element.parentNode)) {
            const str = element.nodeValue;
            if (str == null) {
                return;
            }

            const parent = element.parentNode;
            const originalText = element.nodeValue;
            const regexMatches = [...originalText.matchAll(regex)];

            if (regexMatches.length > 0) {
                let lastIndex = 0;
                const fragment = document.createDocumentFragment();
                let accum = Math.floor(Math.random() * 9000) + 1;

                regexMatches.forEach(match => {
                    accum += 1
                    const matchText = match[0];
                    const matchIndex = match.index;

                    if (matchIndex > lastIndex) {
                        fragment.appendChild(document.createTextNode(originalText.substring(lastIndex, matchIndex)));
                    }

                    const mark = document.createElement('mark');
                    mark.appendChild(document.createTextNode(matchText));
                    mark.id = `mark_${accum}`
                    fragment.appendChild(mark);

                    lastIndex = matchIndex + matchText.length;
                });

                if (lastIndex < originalText.length) {
                    fragment.appendChild(document.createTextNode(originalText.substring(lastIndex)));
                }

                parent.replaceChild(fragment, element);

            }
        }

    }

    console.log(`Regex search running for regex "${regexInput}"`);
    const regex = new RegExp(regexInput, 'gi');
    const body = document.body;

    findMatchAndRecurse(body, regex);

    // After replacement, get the bounding rects of the newly created marks
    const newMarks = document.querySelectorAll('mark');
    newMarks.forEach(newMark => {
        if (isVisible(newMark)) {
            const rect = newMark.getBoundingClientRect();
            matches.push({
                text: newMark.textContent,
                position: {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                },
                id: newMark.id
            });
        }
    });

    return matches;
}





// async function _getMainTabDocument() {
//     return document.body
// }

// async function getMainTabDocument() {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     return await chrome.scripting.executeScript({
//             target: {tabId: tab.id},
//             function: _getMainTabDocument,
//             args: []
//         })
// }
function highlightElement(position, id) {
    console.log(id)
    window.scrollTo({
        top: position.top - 100, // Adjust offset as needed
        behavior: 'smooth'
    });
    element = document.getElementById(id)
    document.querySelectorAll('mark.highlighted').forEach(mark => {
        mark.classList.remove('highlighted');
    });
    element.classList.add('highlighted');
    // const element = document.elementFromPoint(position.left, position.top);
    // if (element && element.tagName === 'MARK') {
    //     document.querySelectorAll('mark.highlighted').forEach(mark => {
    //         mark.classList.remove('highlighted');
    //     });
    //     element.classList.add('highlighted');
        
    // } else {
    //     console.error('No matching element found or element is not a <mark>.');
    // }
}

const inclusiveSearch = document.getElementById("regex-inclusive");
const back = document.getElementById("regex-search-back")
const next = document.getElementById("regex-search-next")
back.addEventListener("click", async function () {
    const last = document.querySelector(".match-item.bold");
    // Get the row before "last"
    const previousRow = last.previousElementSibling;
    if (previousRow) {previousRow.click()}
})
next.addEventListener("click", async function () {
    const last = document.querySelector(".match-item.bold");
    // Get the row after "last"
    const nextRow = last.nextElementSibling;
    if (nextRow) {nextRow.click()}
})


document.getElementById('regex-search').addEventListener('keydown', async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        console.log("searching regex")
        
        const regexInput = document.getElementById('regex-search').value;
        const resultsTable = document.getElementById('regex-search-results');
        let matches;

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: highlightPatternMatches,
            args: [regexInput, inclusiveSearch.checked]
        }, (results) => {
            const matches = results[0].result;

            const rows = resultsTable.querySelectorAll('tr');
            // Iterate over each row
            rows.forEach(row => {
                // Check if the row does not have the class "permanent"
                if (!row.classList.contains('permanent')) {
                    // Remove the row
                    row.remove();
                }
            });
    
            // Check if matches is iterable
            if (Array.isArray(matches)) {
                // Display matches
                matches.forEach((match, index) => {
                    const matchElement = resultsTable.insertRow();
                    const cellOne = matchElement.insertCell();
                    cellOne.innerText = `${index + 1}`
                    const cellTwo = matchElement.insertCell();
                    cellTwo.innerText = `${match.text}`
                    matchElement.classList.add('match-item');
                    
                    matchElement.dataset.position = JSON.stringify(match.position);
                    
                    // Add click event listener to each match item
                    
                    matchElement.addEventListener('click', () => {
                        const last = document.querySelector(".match-item.bold");
                        if (last !== null) {
                            last.classList.remove("bold");
                        }
                        matchElement.classList.add("bold")
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: highlightElement,
                            args: [match.position, match.id]
                        });
                    });
                    if (index == 0) {matchElement.click()}
                    // resultsContainer.appendChild(matchElement);
                });              
            } else {
                console.error('Matches is not iterable:', matches);
            }
        });
    }
    
});

/////////
// TOC //
/////////
const tocArea = document.getElementById("toc-area")
const tocTabButton = document.getElementById("toc-tab-button")

function getTOC() {
    const headers = document.querySelectorAll("H1, H2, H3");
    let returnHtml = '<ol>';
    let currentLevel = 1;

    headers.forEach(function(header) {
        if (!header.innerText) { return; }
        let id = header.id || `TOC-ID-${currentLevel}`;
        header.id = id;

        const headerLevel = parseInt(header.tagName.replace(/\D/g, ''), 10);
        if (headerLevel > currentLevel) {
            returnHtml += "<ol>";
        } else if (headerLevel < currentLevel) {
            returnHtml += "</ol>".repeat(currentLevel - headerLevel);
        }

        returnHtml += `<li class='toc-${header.tagName.toLowerCase()} toc-element' id='${id}'>${header.innerText}</li>`;
        currentLevel = headerLevel;
    });

    return returnHtml + "</ol>".repeat(currentLevel) + "</ol>";
}

async function _openTocElement(id) {
    // currentURL = URL + `#${id}`
    const currentURL = new URL(window.location.href);
    currentURL.hash = id;
    window.location.href = currentURL.href;
}

async function openTocElement(element) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: _openTocElement,
        args: [element.id]
    });
}

tocTabButton.addEventListener("click", async function() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getTOC,
        args: []
    }, (results) => {
        console.log(results)
        tocArea.innerHTML = results[0].result;
        document.querySelectorAll(".toc-element").forEach(async function (element) {
            element.addEventListener("click", async function() {
                openTocElement(element)
            })
        })
    });
});


///////////////
// WebAppSec //
///////////////

// HTML encoding function
function htmlEncode(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// HTML decoding function
function htmlDecode(str) {
    var temp = document.createElement('div');
    temp.innerHTML = str;
    return temp.textContent;
}

// Function to execute code in the context of the current page's tab
async function runFunctionOnPage(func) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: func,
        args: []
    }, (results) => {
        console.log(results);
    });
}

var webAppSecHtmlValContinuous = false;
var webAppSecJsValContinuous = false;
var webAppSecSampleDataContinuous = false;
var webAppSecSelectOffContinuous = false;
var webAppSecHiddenOffContinuous = false;
var webAppSecNoPasteContinuous = false;

document.addEventListener('tabsChanged', async (event) => {
    const tab = event.detail.tab;
    if (tab.active) {
        if (webAppSecHtmlValContinuous) {
            await runFunctionOnPage(removeHtmlValidations);
        }
        if (webAppSecJsValContinuous) {
            await runFunctionOnPage(removeJsValidations);
        }
        if (webAppSecSampleDataContinuous) {
            await runFunctionOnPage(fillWithSampleData);
        }
        if (webAppSecSelectOffContinuous) {
            await runFunctionOnPage(replaceSelectElements);
        }
        if (webAppSecHiddenOffContinuous) {
            await runFunctionOnPage(removeHiddenFields);
        }
        if (webAppSecNoPasteContinuous) {
            await runFunctionOnPage(removeNoPasteRestrictions);
        }
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("web-app-sec-html-val").addEventListener("click", async function () {
        await runFunctionOnPage(removeHtmlValidations);
    });

    document.getElementById("web-app-sec-html-val-ckbx").addEventListener("change", function () {
        webAppSecHtmlValContinuous = this.checked;
        runFunctionOnPage(removeHtmlValidations);
    });

    document.getElementById("web-app-sec-js-val").addEventListener("click", async function () {
        await runFunctionOnPage(removeJsValidations);
    });

    document.getElementById("web-app-sec-js-val-ckbx").addEventListener("change", function () {
        webAppSecJsValContinuous = this.checked;
        runFunctionOnPage(removeJsValidations);
    });

    document.getElementById("web-app-sec-sample-data").addEventListener("click", async function () {
        await runFunctionOnPage(fillWithSampleData);
    });

    document.getElementById("web-app-sec-sample-data-ckbx").addEventListener("change", function () {
        webAppSecSampleDataContinuous = this.checked;
        runFunctionOnPage(fillWithSampleData);
    });

    document.getElementById("web-app-sec-select-off").addEventListener("click", async function () {
        await runFunctionOnPage(replaceSelectElements);
    });

    document.getElementById("web-app-sec-select-off-ckbx").addEventListener("change", function () {
        webAppSecSelectOffContinuous = this.checked;
        runFunctionOnPage(replaceSelectElements);
    });

    document.getElementById("web-app-sec-hidden-off").addEventListener("click", async function () {
        await runFunctionOnPage(removeHiddenFields);
    });

    document.getElementById("web-app-sec-hidden-off-ckbx").addEventListener("change", function () {
        webAppSecHiddenOffContinuous = this.checked;
        runFunctionOnPage(removeHiddenFields);
    });

    document.getElementById("web-app-sec-no-paste").addEventListener("click", async function () {
        await runFunctionOnPage(removeNoPasteRestrictions);
    });

    document.getElementById("web-app-sec-no-paste-ckbx").addEventListener("change", function () {
        webAppSecNoPasteContinuous = this.checked;
        runFunctionOnPage(removeNoPasteRestrictions);
    });

    const encoderElement = document.getElementById("web-app-sec-encoder");
    const decoderElement = document.getElementById("web-app-sec-decoder");

    async function webAppSecEncode() {
        // Get the encoding type (HTML or URL) selected by the user
        var encType = document.getElementById("web-app-sec-encoder-type").value;
        
        // Encode the textContent and set web-app-sec-decoder's text content as the encoded value
        if (encType === "HTML") {
            decoderElement.value = htmlEncode(encoderElement.value);
        } else if (encType === "URL") {
            decoderElement.value = encodeURIComponent(encoderElement.value);
        }
    }

    async function webAppSecDecode() {
        // Get the encoding type (HTML or URL) selected by the user
        var encType = document.getElementById("web-app-sec-encoder-type").value;
    
        // Decode the textContent and set web-app-sec-encoder's text content as the decoded value
        if (encType === "HTML") {
            encoderElement.value = htmlDecode(decoderElement.value);
        } else if (encType === "URL") {
            encoderElement.value = decodeURIComponent(decoderElement.value);
        }
    }

    encoderElement.addEventListener("input", webAppSecEncode);
    
    decoderElement.addEventListener("input", webAppSecDecode);

    document.getElementById("cookies-header").addEventListener("mouseover", loadCookies)

    document.getElementById("web-app-sec-enc-cpy").addEventListener("click", async function () {
        copyValue(encoderElement)
    })
    document.getElementById("web-app-sec-dec-cpy").addEventListener("click", async function () {
        copyValue(decoderElement)
    })
    document.getElementById("web-app-sec-enc-pst").addEventListener("click", async function () {
        pasteValue(encoderElement).then((value)=> {
            webAppSecEncode()
        })
    })
    document.getElementById("web-app-sec-dec-pst").addEventListener("click", async function () {
        pasteValue(decoderElement).then((value)=> {
            webAppSecDecode()
        })
        
    })
    
});

function fillWithSampleData() {
    // Select all input, textarea, and select elements
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (input.tagName.toLowerCase() === 'textarea') {
            // For textareas, fill with sample text
            input.value = 'Sample text for textarea';
        } else if (input.tagName.toLowerCase() === 'select') {
            // For select elements, select the first option
            if (input.options.length > 0) {
                input.selectedIndex = 0; // Select the first option
            }
        } else if (input.tagName.toLowerCase() === 'input') {
            // Handle different types of input elements
            switch (input.type) {
                case 'text':
                    input.value = 'wiener';
                    break;
                case 'number':
                    input.value = '123';
                    break;
                case 'email':
                    input.value = 'sample@example.com';
                    break;
                case 'password':
                    input.value = 'peter';
                    break;
                case 'checkbox':
                case 'radio':
                    input.checked = true; // Check all checkboxes and radio buttons
                    break;
                case 'date':
                    input.value = '2024-01-01'; // Sample date
                    break;
                case 'url':
                    input.value = 'https://example.com';
                    break;
                case 'tel':
                    input.value = '+1234567890';
                    break;
                case 'range':
                    input.value = input.max ? input.max : '50'; // Set to max or 50 if max is not defined
                    break;
                default:
                    input.value = 'Sample data'; // Default for other input types
            }
        }
    });

    console.log("All inputs have been filled with sample data.");
}

function replaceSelectElements() {
    // Find all select elements in the document
    const selectElements = document.querySelectorAll('select');
  
    selectElements.forEach(select => {
      // Get the selected value and name attribute of the select element
      const selectedValue = select.value;
      const selectName = select.name;
  
      // Create a new input element
      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = selectedValue;
      inputElement.name = selectName;
  
      // Replace the select element with the input element
      select.parentNode.replaceChild(inputElement, select);
    });
    // Find all radio button groups by their name
    const radioGroups = {};
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    radioButtons.forEach(radio => {
        // Group radio buttons by their name attribute
        const name = radio.name;
        if (!radioGroups[name]) {
            radioGroups[name] = [];
        }
        radioGroups[name].push(radio);
    });

    // Replace each group of radio buttons
    Object.keys(radioGroups).forEach(name => {
        const radios = radioGroups[name];

        // Find the checked radio button in the group
        const checkedRadio = radios.find(radio => radio.checked);
        const selectedValue = checkedRadio ? checkedRadio.value : '';

        // Create a new input element for the group
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = selectedValue;
        inputElement.name = name;

        // Replace the first radio button with the input element
        // and remove the rest from the DOM
        if (radios.length > 0) {
            radios[0].parentNode.replaceChild(inputElement, radios[0]);
            radios.slice(1).forEach(radio => radio.remove());
        }
    });
  }
  
// Function to remove HTML validations like 'required', 'minlength', etc.
function removeHtmlValidations() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Remove various validation attributes
        input.removeAttribute('required');
        input.removeAttribute('minlength');
        input.removeAttribute('maxlength');
        input.removeAttribute('pattern');
        input.removeAttribute('step');
        input.removeAttribute('min');
        input.removeAttribute('max');

        // List of input types to be converted to text
        const typesToConvert = ['email', 'color', 'date', 'datetime-local', 'number', 'range', 'tel', 'url', 'week', 'time'];

        // Check if input is of a type that needs to be converted to text
        if (input.tagName.toLowerCase() === 'input' && typesToConvert.includes(input.type)) {
            input.type = 'text';
        }
    });
    console.log("HTML input validations removed.");
}

function removeHiddenFields() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.style.display === "none") {
            input.style.display = "block"
        }
        if (input.tagName.toLowerCase() === 'input' && input.type === 'hidden') {
            input.type = 'text';
        }
    });
    console.log("Hidden Fields Shown.");
}

// Function to remove JavaScript validations by disabling event listeners related to validation
function removeJsValidations() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        const clone = input.cloneNode(true);
        input.parentNode.replaceChild(clone, input);
    });
    console.log("JavaScript input validations removed.");
}

// Function to remove 'no-paste' restrictions on input fields
function removeNoPasteRestrictions() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.removeAttribute('onpaste');
        input.onpaste = null;
    });
    console.log("No-paste restrictions removed.");
}

function loadCookies() {
    const site_only = true;
    if (site_only) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const url = new URL(tabs[0].url);
            const domain = url.hostname;
            chrome.cookies.getAll({domain: domain}, function (cookies) {
                displayCookies(cookies);
            });
        });
    } else {
        chrome.cookies.getAll({}, function (cookies) {
            displayCookies(cookies);
        });
    }
}


function displayCookies(cookies) {
    // Edit and Delete not working, need to style list items
    const list = document.getElementById('cookie-list');
    list.innerHTML = ''; // clear the list

    for (let cookie of cookies) {
        // Create a list item for each cookie
        const listItem = document.createElement('li');
        listItem.classList.add('cookie-item');

        // Create a button to toggle the visibility of the cookie details
        const toggleButton = document.createElement('button');
        toggleButton.textContent = `${truncateString(cookie.name, 25)} - ${truncateString(cookie.value, 25)} ${truncateString(cookie.domain, 25)}`;
        toggleButton.addEventListener('click', () => {
            detailDiv.style.display = detailDiv.style.display === 'none' ? '' : 'none';
        });
        toggleButton.classList.add("subtle-button")
        listItem.appendChild(toggleButton);

        const detailDiv = document.createElement('div');
        detailDiv.style.display = 'none';

        // Create a textarea to hold the cookie details
        const detailsTextarea = document.createElement('textarea');
        detailsTextarea.rows = 10;
        detailsTextarea.cols = 28;
        // detailsTextarea.style.display = 'none'; // hide the textarea by default
        detailsTextarea.textContent = JSON.stringify(cookie, null, 1);
        detailsTextarea.readOnly = true;
        detailDiv.appendChild(detailsTextarea);

        // Create a break
        const br = document.createElement("br");
        detailDiv.appendChild(br);

        // Create a delete button
        const deleteButton = document.createElement('button');
        
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            chrome.cookies.remove({url: "http://" + cookie.domain + cookie.path, name: cookie.name}, function(deletedCookie) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else {
                    console.log(deletedCookie);
                    // Remove the list item from the list
                    list.removeChild(listItem);
                }
            });
        });
        // deleteButton.style.display = 'none';
        detailDiv.appendChild(deleteButton);

        // Create an edit button
        if (cookie.httpOnly) {
            const httpOnlyWarning = document.createElement('small');
            httpOnlyWarning.textContent = '  This cookie cannot be edited (httpOnly)';
            detailDiv.appendChild(httpOnlyWarning);
        } else if (cookie.domain.startsWith('.')) { 
            const httpOnlyWarning = document.createElement('small');
            httpOnlyWarning.textContent = "  This cookie cannot be edited (cookie's domain starts with a dot)";
            detailDiv.appendChild(httpOnlyWarning);
        } else {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                // Make the textarea editable and focus it
                detailsTextarea.readOnly = false;
                detailsTextarea.focus();
            });
            detailDiv.appendChild(editButton);
        }
        listItem.appendChild(detailDiv);

        // Add an event listener for when the textarea loses focus
        detailsTextarea.addEventListener('blur', () => {
            // Make the textarea read-only again
            detailsTextarea.readOnly = true;

            // Parse the edited JSON and save the changes to the cookie
            try {
                console.log(detailsTextarea.value)
                const editedCookie = JSON.parse(detailsTextarea.value);
                console.log(editedCookie.value)
                console.log(cookie.domain + cookie.path)
                chrome.cookies.set({
                    url: "https://" + cookie.domain + cookie.path,
                    name: cookie.name,
                    value: editedCookie.value,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    // Add other cookie properties here if needed
                }, function(cookie) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        showNotification("Error: " + chrome.runtime.lastError.message)
                    } else {
                        console.log(cookie);
                        showNotification("Cookie updated")
                    }
                });
            } catch (error) {
                console.error('Invalid JSON:', error);
                showNotification("Error: Invalid JSON. " + error)
            }
        });

        // Add the list item to the list
        list.appendChild(listItem);
    }
}

function truncateString(str, maxLength) {
    // Check if the string length is greater than the maximum allowed length
    if (str.length > maxLength) {
        // Truncate the string and add an ellipsis
        return str.slice(0, maxLength - 3) + '...';
    }
    // Return the original string if no truncation is needed
    return str;
}

///////////
// OTHER //
///////////

const switchButtons = document.querySelectorAll(".switch-button")
const regexSearchTabButton = document.getElementById("regex-search-tab-button")
const group1 = document.querySelector(".group1")
const group2 = document.querySelector(".group2")

switchButtons.forEach(async function (button) {
    button.addEventListener("click", async function() {
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


// EDGE SPECIFIC
if (navigator.userAgent.includes("Edg")) {
    console.log("Edge settings running")
    // Zoom in/out since not supported in Edge
    // Add event listener to detect key presses
    customZoom()
}

async function customZoom() {
    zoomSetting = await getSetting("zoomSetting", 1)
    document.body.style.zoom = zoomSetting

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
            storeSetting("zoomSetting", parseFloat(getComputedStyle(document.body).zoom))
        }
    });
}



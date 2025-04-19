///////////////
// Page Notes//
///////////////

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


///////////////////////
// REGEX PAGE SEARCH //
///////////////////////

function highlightPatternMatches(regexInput, inclusiveSearch = false) {
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
        } else {
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                element === document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
            );
        }
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


var inclusiveSearch;
var back;
var next;
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

async function regexSearch() {
    console.log("searching regex")

    const regexInput = document.getElementById('regex-search').value;
    const resultsTable = document.getElementById('regex-search-results');
    let matches;

    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
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
                        target: {
                            tabId: tab.id
                        },
                        function: highlightElement,
                        args: [match.position, match.id]
                    });
                });
                if (index == 0) {
                    matchElement.click()
                }
                // resultsContainer.appendChild(matchElement);
            });
        } else {
            console.error('Matches is not iterable:', matches);
        }
    });
}

/////////
// TOC //
/////////
function getTOC() {
    const headers = document.querySelectorAll("H1, H2, H3");
    let returnHtml = '<ol>';
    let currentLevel = 1;

    headers.forEach(function (header) {
        if (!header.innerText) {
            return;
        }
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
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
        function: _openTocElement,
        args: [element.id]
    });
}

///////////////
// WebAppSec //
///////////////

var webAppSecHtmlValContinuous = false;
var webAppSecJsValContinuous = false;
var webAppSecSampleDataContinuous = false;
var webAppSecSelectOffContinuous = false;
var webAppSecHiddenOffContinuous = false;
var webAppSecNoPasteContinuous = false;


function fillWithSampleData() {
    // Select all input, textarea, and select elements
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (input.tagName.toLowerCase() === 'textarea') {
            // For textareas, fill with sample text if the value is blank
            if (!input.value.trim()) {
                input.value = 'Sample text for textarea';
            }
        } else if (input.tagName.toLowerCase() === 'select') {
            // For select elements, select the first option if none is selected
            if (input.selectedIndex === -1 && input.options.length > 0) {
                input.selectedIndex = 0; // Select the first option
            }
        } else if (input.tagName.toLowerCase() === 'input') {
            // Handle different types of input elements
            switch (input.type) {
                case 'text':
                    if (!input.value.trim()) {
                        input.value = 'wiener';
                    }
                    break;
                case 'number':
                    if (!input.value.trim()) {
                        input.value = '123';
                    }
                    break;
                case 'email':
                    if (!input.value.trim()) {
                        input.value = 'sample@example.com';
                    }
                    break;
                case 'password':
                    if (!input.value.trim()) {
                        input.value = 'peter';
                    }
                    break;
                case 'checkbox':
                case 'radio':
                    if (!input.checked) {
                        input.checked = true; // Check all checkboxes and radio buttons if not already checked
                    }
                    break;
                case 'date':
                    if (!input.value.trim()) {
                        input.value = '2024-01-01'; // Sample date
                    }
                    break;
                case 'url':
                    if (!input.value.trim()) {
                        input.value = 'https://example.com';
                    }
                    break;
                case 'tel':
                    if (!input.value.trim()) {
                        input.value = '+1234567890';
                    }
                    break;
                case 'range':
                    if (!input.value.trim()) {
                        input.value = input.max ? input.max : '50'; // Set to max or 50 if max is not defined
                    }
                    break;
                default:
                    if (!input.value.trim()) {
                        input.value = 'Sample data'; // Default for other input types
                    }
            }
        }
    });

    console.log("All inputs have been filled with sample data where blank.");
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
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            const url = new URL(tabs[0].url);
            const domain = url.hostname;
            chrome.cookies.getAll({
                domain: domain
            }, function (cookies) {
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

        // Create a table to hold the cookie details
        const cookieTable = document.createElement('table');
        cookieTable.style.borderCollapse = 'collapse';
        cookieTable.style.width = '100%';

        // Populate the table with cookie details
        for (const [key, value] of Object.entries(cookie)) {
            const row = createTableRow(key, value);
            cookieTable.appendChild(row);
        }

        // Add the table to the detailDiv
        detailDiv.appendChild(cookieTable);

        // Create an edit button
        if (cookie.httpOnly) {
            const httpOnlyWarning = document.createElement('small');
            httpOnlyWarning.textContent = "  Can't edit: httpOnly";
            detailDiv.appendChild(httpOnlyWarning);
        } else if (cookie.domain.startsWith('.')) {
            const httpOnlyWarning = document.createElement('small');
            httpOnlyWarning.textContent = "  Can't edit: Domain starts with '.'";
            detailDiv.appendChild(httpOnlyWarning);
        } else {
            // Add a save button below the table
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            detailDiv.appendChild(saveButton);
            // Add event listener to the save button
            saveButton.addEventListener('click', async () => {
                const updatedCookie = {};

                // Loop through each input in the table to collect updated values
                const inputs = cookieTable.querySelectorAll('input');
                inputs.forEach(input => {
                    const key = input.getAttribute('data-key');
                    const value = input.value;
                    updatedCookie[key] = value;
                });

                // Call the function to update the cookie
                await updateCookie(updatedCookie);
                showNotification('Cookie updated successfully!');
            });
        }
        listItem.appendChild(detailDiv);

        // Create a delete button
        const deleteButton = document.createElement('button');

        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            chrome.cookies.remove({
                url: "http://" + cookie.domain + cookie.path,
                name: cookie.name
            }, function (deletedCookie) {
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

        // Add the list item to the list
        list.appendChild(listItem);
    }
}



// Define a helper function to create a table row
function createTableRow(key, value) {
    const row = document.createElement('tr');

    // Create a cell for the cookie attribute name
    const keyCell = document.createElement('td');
    keyCell.style.border = '1px solid #ccc';
    keyCell.style.padding = '8px';
    keyCell.style.backgroundColor = '#f9f9f9';
    keyCell.textContent = key;

    // Create a cell for the cookie attribute value (editable)
    const valueCell = document.createElement('td');
    valueCell.style.border = '1px solid #ccc';
    valueCell.style.padding = '8px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.style.width = '100%';

    // Add an attribute to store the key name for easier retrieval later
    input.setAttribute('data-key', key);

    valueCell.appendChild(input);
    row.appendChild(keyCell);
    row.appendChild(valueCell);

    return row;
}



// Function to update the cookie using Chrome Extension API or browser API
async function updateCookie(updatedCookie) {
    // Assuming 'updatedCookie' contains all necessary fields such as 'name', 'value', 'domain', 'path', etc.
    chrome.cookies.set({
        url: `https://${updatedCookie.domain}`,
        name: updatedCookie.name,
        value: updatedCookie.value,
        domain: updatedCookie.domain,
        path: updatedCookie.path,
        secure: updatedCookie.secure === 'true',
        httpOnly: updatedCookie.httpOnly === 'true',
        sameSite: updatedCookie.sameSite
    }, (cookie) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            console.log('Cookie set:', cookie);
        }
    });
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
//////////////
// REQUESTS //
//////////////

let addedRequestsListeners = false;

function addWebAppSecListeners() {
    if (!addedRequestsListeners) {
        addedRequestsListeners = true;
        
        // Get request Body
        chrome.webRequest.onBeforeRequest.addListener(
            function (details) {
                lastRequest = {};
                lastResponse = {};

                // Extract Content-Type header from request
                const contentTypeHeader = details.requestHeaders ? 
                    details.requestHeaders.find(header => header.name.toLowerCase() === 'content-type') : 
                    null;
                const contentType = contentTypeHeader ? contentTypeHeader.value : '';

                // Get the current URL's domain
                getCurrentURL().then(currentURL => {
                    var currentDomain = ""
                    try {
                        currentDomain = new URL(currentURL).hostname;
                    } catch {
                        console.log(`Failed to construct URL for ${currentURL}`)
                        return
                    }

                    // Filter request based on file types and domain
                    if (isFilteredRequest(details.url, contentType, currentDomain)) {
                        console.log(`Filtered request for ${details.url}`)
                        return; // Skip filtered requests
                    } else {
                        console.log(`Unfiltered request for ${details.url}`)

                        lastRequest["body"] = details.requestBody ? details.requestBody.raw : null;
                        lastRequest["method"] = details.method;
                        lastRequest["url"] = details.url;
                        lastRequest["requestId"] = details.requestId;

                        updateRequestResponseTable();
                    }
                });
            },
            { urls: ["<all_urls>"] },
            ["requestBody"]
        );

        // Modify reqeust Headers per settings
        chrome.webRequest.onBeforeSendHeaders.addListener(
            // Test here: https://www.whatismybrowser.com/detect/what-http-headers-is-my-browser-sending/
            function(details) {
              return getSetting("web-app-sec-header-modifications").then((headerModifications) => {
                // headerModifications is a dictionary of headers you want to add or modify
                if (headerModifications && details.requestHeaders) {
                  // Convert request headers to a map for easier modification
                  let headersMap = new Map(details.requestHeaders.map(header => [header.name.toLowerCase(), header]));
          
                  // Iterate through each header modification
                  for (const [key, value] of Object.entries(headerModifications)) {
                    let lowerKey = key.toLowerCase();
                    if (value === null) {
                      // If the value is null, remove the header
                      headersMap.delete(lowerKey);
                    } else {
                      // Otherwise, add or update the header
                      headersMap.set(lowerKey, { name: key, value: value });
                    }
                  }
          
                  // Convert the map back to an array
                  details.requestHeaders = Array.from(headersMap.values());
                //   console.log(`Setting headers to`)
                //   console.log(details.requestHeaders)
                }
          
                return { requestHeaders: details.requestHeaders };
              });
            },
            { urls: ["<all_urls>"] },
            ["requestHeaders"]
          );
          
        // Get request headers
        chrome.webRequest.onSendHeaders.addListener(
            function (details) {
                if (details.requestId != lastRequest.requestId) {
                    return
                }
                lastRequest["requestHeaders"] = details.requestHeaders;
                updateRequestResponseTable();
            },
            { urls: ["<all_urls>"] },
            ["requestHeaders"]
        );

        chrome.webRequest.onHeadersReceived.addListener(
            function (details) {
                 if (details.requestId != lastRequest.requestId) {
                    return
                }
                lastResponse["responseHeaders"] = details.responseHeaders;
                lastResponse["statusCode"] = details.statusCode; // Ensure statusCode is set
                updateRequestResponseTable();

                try {
                    console.log(details.protocol)
                } catch {
                    console.log("failed to get protocol")
                }
            },
            { urls: ["<all_urls>"] },
            ["responseHeaders"]
        );
    }
}

let lastRequest = {};
let lastResponse = {};
var excludedContentTypes = [];
getSetting("requests-excluded-content-types").then((value) => {
    excludedContentTypes = value;
});
let excludedExtensionsRegex;
getSetting("requests-excluded-extensions").then((value) => {
    // Convert array of extensions to a regex pattern dynamically
    if (value && Array.isArray(value) && value.length > 0) {
        const extensionsPattern = value.map(ext => ext.trim().replace('.', '\\.')).join('|');
        excludedExtensionsRegex = new RegExp(`\\.(${extensionsPattern})$`, 'i');
    } else {
        excludedExtensionsRegex = /\.(png|jpg|jpeg|gif|svg|js|css)$/i; // Default regex pattern
    }
});
var excludedHeaders = [];
getSetting("requests-excluded-headers").then((value) => {
    excludedHeaders = value;
});

// Function to check if the request should be filtered out
function isFilteredRequest(url, contentType, currentDomain) {
    try {
        const urlObject = new URL(url);
        const domain = urlObject.hostname; // Extract the domain
        const pathname = urlObject.pathname; // Extract the path

        // Check if the content type is in the excluded list
        const isExcludedContentType = excludedContentTypes.some(type => contentType.includes(type));

        // Check if the URL path has an excluded file extension
        const isExcludedExtension = excludedExtensionsRegex.test(pathname);

        // Check if the domain is different from the current domain
        const isDifferentDomain = domain !== currentDomain;

        // Return true if any of the conditions are met
        const isExcluded = isExcludedContentType || isExcludedExtension || isDifferentDomain;
        console.log(`URL ${url} with path ${pathname} excluded: ${isExcluded}. CT: ${isExcludedContentType}, Ext: ${isExcludedExtension}, D: ${isDifferentDomain}`)
        return isExcluded
    } catch (e) {
        console.error('Error processing URL:', url, e);
        return true; // Consider invalid URLs as filtered out
    }
}

function updateRequestResponseTable() {
    if (lastRequest && lastResponse) {
        const requestCell = document.getElementById('web-app-sec-request');
        const responseCell = document.getElementById('web-app-sec-response');

        // Clear previous content
        requestCell.innerHTML = '';
        responseCell.innerHTML = '';

        let requestBody = lastRequest.body ? JSON.stringify(lastRequest.body, null, 2) : 'No body';

        // Create and append formatted request details
        const lineOne = document.createElement("span");
        lineOne.innerText = `${lastRequest.method} ${lastRequest.url} HTTP/1.1`;
        requestCell.appendChild(lineOne);

        requestCell.appendChild(document.createElement("br"));

        if (lastRequest.requestHeaders) {
            lastRequest.requestHeaders.forEach(header => {
                if (!excludedHeaders.includes(header.name.toLowerCase())) {
                    const headerLine = document.createElement("span");
                    headerLine.textContent = `${header.name}: ${header.value}`;
                    requestCell.appendChild(headerLine);
                    requestCell.appendChild(document.createElement("br"));
                }
            });
        }

        const bodyLine = document.createElement("pre");
        bodyLine.innerText = `${requestBody}`;
        requestCell.appendChild(bodyLine);

        // Format response details
        let responseHeaders = '';
        if (lastResponse.responseHeaders) {
            lastResponse.responseHeaders.forEach(header => {
                if (!excludedHeaders.includes(header.name.toLowerCase())) {
                    responseHeaders += `${header.name}: ${header.value}<br>`;
                }
            });
        }

        let responseBody = lastResponse.body ? JSON.stringify(lastResponse.body, null, 2) : 'Chrome API does not allow access to response body';

        // Create and append formatted response details
        const respCode = lastResponse.statusCode ? lastResponse.statusCode:"No Response"
        const respText = lastResponse.statusCode ? getStatusText(lastResponse.statusCode): ""
        const responseStatus = `HTTP/1.1 ${respCode} ${respText}`;
        
        const responseStatusLine = document.createElement("div");
        responseStatusLine.innerText = responseStatus;
        responseCell.appendChild(responseStatusLine);

        responseCell.appendChild(document.createElement("br"));

        const responseHeadersLine = document.createElement("div");
        responseHeadersLine.innerHTML = `${responseHeaders}<br>Body:<br><pre>${responseBody}</pre>`;
        responseCell.appendChild(responseHeadersLine);
    }
}


// Function to get status text from status code
function getStatusText(statusCode) {
    const statusTexts = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };

    return statusTexts[statusCode] || 'Unknown Status';
}

async function webAppSecAnalyzePage() {
    const resultDiv = document.getElementById("web-app-sec-anal-results");
    if (!resultDiv) {
        console.error("Result div not found!");
        return;
    }

    const results = await runFunctionOnPage(webAppSecAnalyzePageOnPage);
    resultDiv.innerHTML = ""; // Clear any existing content
    for (const [key, value] of Object.entries(results)) {
        console.log(key, value)
        resultDiv.appendChild(createTableWithHeaders(value, key));
    }
 
}

async function webAppSecAnalyzePageOnPage() {
    try {
        // Analyze HTML comments
        const htmlComments = [];
        const nodeIterator = document.createNodeIterator(
            document.documentElement,
            NodeFilter.SHOW_COMMENT,
            null,
            false
        );
        let currentNode;
        while (currentNode = nodeIterator.nextNode()) {
            htmlComments.push(currentNode.nodeValue.trim());
        }

        // Analyze scripts
        const scripts = document.querySelectorAll('script');
        const externalScripts = [];
        const inlineScripts = [];

        scripts.forEach(script => {
            if (script.src) {
                externalScripts.push(script.src);
            } else {
                inlineScripts.push(script.textContent.trim());
            }
        });

        // Analyze links
        const links = document.querySelectorAll('a[href]');
        const externalLinks = [];
        const internalLinks = [];

        links.forEach(link => {
            const href = link.href.trim();
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                externalLinks.push(href);
            } else {
                internalLinks.push(href);
            }
        });

        // Example analysis of form actions (security best practice checks)
        const forms = document.querySelectorAll('form');
        const insecureFormActions = [];

        forms.forEach(form => {
            const action = form.action.trim();
            if (action && !action.startsWith('https')) {
                insecureFormActions.push(action);
            }
        });

        // Generate and return results as a JSON object
        return {
            htmlComments,
            externalScripts,
            inlineScripts,
            externalLinks,
            internalLinks,
            insecureFormActions,
        };
    } catch (error) {
        console.error("An error occurred:", error);
        return { error: "An Error Occurred" };
    }
}

function camelCaseToTitleCase(text) {
    // Step 1: Insert spaces before capital letters
    let formattedText = text.replace(/([A-Z])/g, ' $1');
    // Step 2: Capitalize the first letter of the string and make the rest lowercase
    formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1).toLowerCase();
    return formattedText;
}

function createTableWithHeaders(data, header) {
    const table = document.createElement('table');
    table.style = "width: 100%;table-layout: fixed;overflow-wrap: break-word;word-wrap: break-word;white-space: normal;"

    // Helper function to create a header row
    const createHeaderRow = (title) => {
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.textContent = camelCaseToTitleCase(header);
        headerRow.appendChild(headerCell);
        table.appendChild(headerRow);
    };

    // Helper function to create a data row
    const createDataRow = (d) => {
        const row = document.createElement('tr');
        const dataCell = document.createElement('td');
        // const pre = document.createElement("pre");
        // pre.textContent = d
        dataCell.textContent = d
        // dataCell.appendChild(pre)
        dataCell.style = "max-width: 100%;"
        row.appendChild(dataCell)
        table.appendChild(row);
    };

    createHeaderRow(header);
    if (data.length) {
        data.forEach(d => createDataRow(d));
    } else {
        createDataRow('Nothing found.');
    }
    return table;
}

// Helper function to escape HTML content
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}



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

    document.addEventListener('keydown', function (event) {
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

    /////////////////
    // Web App Sec //
    /////////////////

    document.getElementById("web-app-sec-anal-button").addEventListener("click", webAppSecAnalyzePage);

    document.getElementById("web-app-sec-tab-button").addEventListener("click", addWebAppSecListeners);

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
        } else if (encType === "HTMLe") {
            decoderElement.value = htmlEntityEncode(encoderElement.value);
        } else if (encType === "URL") {
            decoderElement.value = encodeURIComponent(encoderElement.value);
        } else if (encType === "*URL") {
            decoderElement.value = urlEncodeAll(encoderElement.value);
        } else if (encType === "2*URL") {
            decoderElement.value = urlEncodeAll(urlEncodeAll(encoderElement.value));
        } else if (encType === "Hex") {
            decoderElement.value = hexEncode(encoderElement.value);
        } else if (encType === "Dec") {
            decoderElement.value = decEncode(encoderElement.value);
        } else if (encType === "B64") {
            decoderElement.value = b64Encode(encoderElement.value);
        }
    }

    async function webAppSecDecode() {
        // Get the encoding type (HTML or URL) selected by the user
        var encType = document.getElementById("web-app-sec-encoder-type").value;

        // Decode the textContent and set web-app-sec-encoder's text content as the decoded value
        if (encType === "HTML") {
            encoderElement.value = htmlDecode(decoderElement.value);
        } else if (encType === "HTMLe") {
            encoderElement.value = htmlEntityDecode(decoderElement.value);
        } else if (encType === "URL") {
            encoderElement.value = decodeURIComponent(decoderElement.value);
        } else if (encType === "*URL") {
            encoderElement.value = urlDecodeAll(decoderElement.value);
        } else if (encType === "2*URL") {
            encoderElement.value = urlDecodeAll(urlDecodeAll(decoderElement.value));
        } else if (encType === "Hex") {
            encoderElement.value = hexDecode(decoderElement.value);
        } else if (encType === "Dec") {
            decoderElement.value = decDecode(encoderElement.value);
        } else if (encType === "B64") {
            decoderElement.value = b64Decode(encoderElement.value);
        }
    }

    encoderElement.addEventListener("input", webAppSecEncode);

    decoderElement.addEventListener("input", webAppSecDecode);

    document.getElementById("web-app-sec-cookies-fetch").addEventListener("click", loadCookies)

    document.getElementById("web-app-sec-enc-cpy").addEventListener("click", async function () {
        copyValue(encoderElement)
    })
    document.getElementById("web-app-sec-dec-cpy").addEventListener("click", async function () {
        copyValue(decoderElement)
    })
    document.getElementById("web-app-sec-enc-pst").addEventListener("click", async function () {
        pasteValue(encoderElement).then((value) => {
            webAppSecEncode()
        })
    })
    document.getElementById("web-app-sec-dec-pst").addEventListener("click", async function () {
        pasteValue(decoderElement).then((value) => {
            webAppSecDecode()
        })
    })

    const commonTestingTable = document.getElementById("web-app-sec-common-testing-table")

    getSetting("web-app-sec-common-testing-inputs").then((value)=> {
        value.forEach(element => {
           const tr = document.createElement('tr')
           const td = document.createElement("td")
           td.classList.add("copy-on-click")
           td.textContent = element
           tr.appendChild(td)
           commonTestingTable.appendChild(tr)
        });
    })


    /////////
    // TOC //
    /////////
    const tocArea = document.getElementById("toc-area")
    const tocTabButton = document.getElementById("toc-tab-button")

    tocTabButton.addEventListener("click", async function () {
        let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            function: getTOC,
            args: []
        }, (results) => {
            console.log(results)
            tocArea.innerHTML = results[0].result;
            document.querySelectorAll(".toc-element").forEach(async function (element) {
                element.addEventListener("click", async function () {
                    openTocElement(element)
                })
            })
        });
    });

    //////////////////
    // REGEX Search //
    //////////////////

    document.getElementById('regex-search').addEventListener('keydown', async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            regexSearch()
        }
    });

    inclusiveSearch = document.getElementById("regex-inclusive");
    back = document.getElementById("regex-search-back")
    next = document.getElementById("regex-search-next")
    back.addEventListener("click", async function () {
        const last = document.querySelector(".match-item.bold");
        // Get the row before "last"
        const previousRow = last.previousElementSibling;
        if (previousRow) {
            previousRow.click()
        }
    })
    next.addEventListener("click", async function () {
        const last = document.querySelector(".match-item.bold");
        // Get the row after "last"
        const nextRow = last.nextElementSibling;
        if (nextRow) {
            nextRow.click()
        }
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

        saveNoteTimeOut()

    })
    
    document.getElementById("add-current-domain").addEventListener("click", async function () {
        const url = await getCurrentURL()
        let domain = await get_default_title(url)
        let url_pattern = await get_default_pattern(domain)
        url_pattern = url_pattern.substring(0, maxPageNotesURLChar - 1);
        url_pattern = urlPatternElement.value + "|" + url_pattern
        urlPatternElement.value = url_pattern

        saveNoteTimeOut()
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

    /////////////////
    // Web App Sec //
    /////////////////

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

    ////////////////
    // Page Notes //
    ////////////////

    updatePageNoteURL()

});
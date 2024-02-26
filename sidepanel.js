////////////////
// Page notes //
////////////////

document.getElementById('page-notes-textarea').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
      document.getElementById("page-notes-unsaved-changes").classList.add("hidden")
      document.getElementById("page-notes-saved-changes").classList.remove("hidden")
    } else if (event.altKey && event.key === 't') {
        let currentDate = new Date();
        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        let formattedDate = currentDate.toLocaleString('en-GB', options);
        this.value += formattedDate;
}    else {
        document.getElementById("page-notes-saved-changes").classList.add("hidden")
        document.getElementById("page-notes-unsaved-changes").classList.remove("hidden")
    }
});

// document.getElementById('page-notes-textarea').addEventListener('change', function(event) {
//     document.getElementById("page-notes-saved-changes").classList.add("hidden")
//     document.getElementById("page-notes-unsaved-changes").classList.remove("hidden")
// });

document.getElementById('url-pattern').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
    }
});


async function storeKeyValue() {
    const key = document.getElementById("url-pattern").value
    const value = document.getElementById("page-notes-textarea").value
    if (key && value) {
        if (key.length > await getSetting("max-key-char-page-notes")) {
            showNotification("Url is too long")
            return ""
        } else if (value.length > await getSetting("max-value-char-page-notes")) {
            showNotification("Note is too long")
            return ""
        } else {
            if (await getSetting("encrypt-page-notes")) {
                // data[key] = encrypt(value)
                storePageNoteData(key, encrypt(value))
            } else {
                // data[key] = value;
                storePageNoteData(key, value)
            }
            // store("page-note-data", data)
            showNotification("Saved")
        }
    } else {
        showNotification("Provide a url and note")
    }
}

function defaultPattern(url) {
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

async function checkMatch(url, isPattern=false) {
    const result = await searchPageNoteData(url, isPattern=isPattern)
    const key = result[0]
    const value = result[1]
    if (await getSetting("encrypt-page-notes")) {
        return [key, decrypt(value)]; // Return the corresponding value
    } else {
        return [key, value]; // Return the corresponding value
    }
}

let data = {};
get("page-note-data").then((value) => {
    data = value || {};
  });


document.addEventListener("DOMContentLoaded", async function () {
    // Convert old page notes to new storage method
    async function convertPageNotes(data) {
        for (const key in data) {
            if (! await get(key)) {
                console.log("Converting page note " + key + " to new storage method")
                storePageNoteData(key, data[key]);
            }
        }
    }
    convertPageNotes(data);
});



// Get Page Note Data 
async function getPageNoteData(key) {
    return get("page-note-data-" + key)
}

// Set Page Note Data
async function storePageNoteData(key, value) {
    store("page-note-data-" + key, value)
}

// Remove Page Not Data
async function removePageNoteData(key) {
    chrome.storage.sync.remove("page-note-data-" + key)
}

// Search Page Note Data
async function searchPageNoteData(searchKey, isPattern=true) {
    results = await chrome.storage.sync.get()
    for (result in results) {
        if (result.startsWith("page-note-data-")) {
            if (! isPattern) {
                 // If the searchKey is a pattern just like the 
                 // stored key, then it would just be an ==.
                 const regexPattern = new RegExp(result.substring(15));
                 if (regexPattern.test(searchKey)) {
                    return [result.substring(15), results[result]]
                }
            } else {
                if (searchKey == result.substring(15)) {
                    return [result.substring(15), results[result]]
                }
            }
            
        }
    }
    return [defaultPattern(searchKey), ""]
}


async function setActiveURL(url, isPattern=false) {
    keyTextArray = await checkMatch(url, isPattern=isPattern)
    console.log(keyTextArray)
    document.getElementById("url-pattern").value = keyTextArray[0]
    document.getElementById("page-notes-textarea").value = keyTextArray[1]
}

let changeWithTabs = true

document.getElementById("page-notes-toggle-change").addEventListener("click", function () {
    changeWithTabs = document.getElementById("page-notes-toggle-change").checked
});

document.addEventListener("DOMContentLoaded", async function () {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    console.log(tab.url)
    setActiveURL(tab.url);
  });
  
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (changeWithTabs) {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.active) {
        console.log("======= active tab url", tab.url);
        setActiveURL(tab.url);
        }
    }
  });
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeWithTabs) {
        if (tab.active) {
        console.log("======= updated tab url", tab.url);
        setActiveURL(tab.url);
        }
    }
  });


///////////////////////
// Page Notes Search //
///////////////////////

const searchResults = document.getElementById("page-notes-search-results")
const searchBox = document.getElementById("page-notes-search")
const resultTable = document.getElementById("page-notes-result-table")

searchBox.addEventListener("keyup", async function () {
    const searchKey = searchBox.value
    let matches = []
    if (! await getSetting("encrypt-page-notes")) {
        results = await chrome.storage.sync.get()
        for (result in results) {
            if (result.startsWith("page-note-data-")) {
                if (result.includes(searchKey) | results[result].includes(searchKey)) {
                    matches.push(result.substring(15))
                }  
            }
        }
    } else {
        results = await chrome.storage.sync.get()
        for (result in results) {
            if (result.startsWith("page-note-data-")) {
                if (result.includes(searchKey)) {
                    matches.push(result)
                }  
            }
        }
    }
    resultTable.innerHTML = ""
    if (matches.length > 0) {
        highlightedIndex = 0;
        const tableBody = document.createElement('tbody');
        matches.forEach(async (match, index) => {
          const row = tableBody.insertRow();
          row.style="border-radius: 5px;"
          const keyCell = row.insertCell();
          const valueCell = row.insertCell();
          const deleteCell = row.insertCell();
          keyCell.textContent = truncateText(match, 20) + ":";
          keyCell.classList.add("bold")
          keyCell.classList.add("page-note-result")
          //keyCell.attributes.add("key", match)
          keyCell.setAttribute("key", match)
          keyCell.addEventListener("click", function () {
            console.log("Opening page note")
            changeTabs(document.getElementById("page-notes-tab-button"))()
            setActiveURL(this.getAttribute("key"), isPattern=true);
            //document.getElementById("url-pattern").value=
          })
          keyCell.id = match
          if (await getSetting("encrypt-page-notes")) {
                valueCell.textContent = truncateText(decrypt(await getPageNoteData(match)), 10);
            } else {
                valueCell.textContent = truncateText(await getPageNoteData(match), 10);
            }
          valueCell.style="width: 60vw;"
          valueCell.classList.add("truncate")
          deleteCell.textContent = "X"
          //deleteCell.attributes.add("key_id", match)
          deleteCell.addEventListener("click", function () {
             removePageNoteData(match);
             //  store("page-note-data", data)
             row.remove()
             showNotification("Deleted" + match)
          })
          if (index === highlightedIndex) {
            row.classList.add('highlighted');
          }
        });
        resultTable.appendChild(tableBody);
        
      } else {
        resultTable.textContent = `No matches found for '${searchKey}'.`;
      }
});

///////////////////
// Site Settings //
///////////////////

async function refreshSiteSettings() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    try {
        const url = new URL(tab.url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/";
        const cookies = await chrome.contentSettings.cookies.get({primaryUrl: domain});
        if (cookies.setting === "block") {
            document.getElementById("settings-toggle-cookies").checked = true;
        } else {
            document.getElementById("settings-toggle-cookies").checked = false;
        }

        const javascript = await chrome.contentSettings.javascript.get({primaryUrl: domain});
        if (javascript.setting === "block") {
            document.getElementById("settings-toggle-javascript").checked = true;
        } else {
            document.getElementById("settings-toggle-javascript").checked = false;
        }

        const popups = await chrome.contentSettings.popups.get({primaryUrl: domain});
        if (popups.setting === "block") {
            document.getElementById("settings-toggle-popups").checked = true;
        }
        else {
            document.getElementById("settings-toggle-popups").checked = false;
        }

        const camera = await chrome.contentSettings.camera.get({primaryUrl: domain});
        if (camera.setting === "block") {
            document.getElementById("settings-toggle-camera").checked = true;
        }
        else {
            document.getElementById("settings-toggle-camera").checked = false;
        }

        const microphone = await chrome.contentSettings.microphone.get({primaryUrl: domain});
        if (microphone.setting === "block") {
            document.getElementById("settings-toggle-microphone").checked = true;
        } else {
            document.getElementById("settings-toggle-microphone").checked = false;
        }

        const automaticDownloads = await chrome.contentSettings.automaticDownloads.get({primaryUrl: domain});
        if (automaticDownloads.setting === "block") {
            document.getElementById("settings-toggle-automatic-downloads").checked = true;
        }
        else {
            document.getElementById("settings-toggle-automatic-downloads").checked = false;
        }

        const location = await chrome.contentSettings.location.get({primaryUrl: domain});
        if (location.setting === "block") {
            document.getElementById("settings-toggle-location").checked = true;
        } else {
            document.getElementById("settings-toggle-location").checked = false;
        }

        document.getElementById("settings-current-site").innerText = domain;

        const notifications = await chrome.contentSettings.notifications.get({primaryUrl: domain});
        if (notifications.setting === "block") {
            document.getElementById("settings-toggle-notifications").checked = true;
        } else {
            document.getElementById("settings-toggle-notifications").checked = false;
        }

    } catch (e) {
        return
    }

}

// Refresh Site Settings Triggers
document.addEventListener("DOMContentLoaded", async function () {
    refreshSiteSettings()
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    refreshSiteSettings()
});
  
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    refreshSiteSettings()
});


// Cookies 
document.getElementById("settings-toggle-cookies").addEventListener("click", function () {
    const blockCookies = document.getElementById("settings-toggle-cookies").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockCookies)
        if (blockCookies) {
            chrome.contentSettings.cookies.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.cookies.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    });
});

// Javascript
document.getElementById("settings-toggle-javascript").addEventListener("click", function () {
    const blockJavascript = document.getElementById("settings-toggle-javascript").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockJavascript)
        if (blockJavascript) {
            chrome.contentSettings.javascript.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.javascript.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});

// Pop-ups and redirects
document.getElementById("settings-toggle-popups").addEventListener("click", function () {
    const blockPopups = document.getElementById("settings-toggle-popups").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockPopups)
        if (blockPopups) {
            chrome.contentSettings.popups.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.popups.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});

// Camera
document.getElementById("settings-toggle-camera").addEventListener("click", function () {
    const blockCamera = document.getElementById("settings-toggle-camera").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockCamera)
        if (blockCamera) {
            chrome.contentSettings.camera.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.camera.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});

// Microphone
document.getElementById("settings-toggle-microphone").addEventListener("click", function () {
    const blockMicrophone = document.getElementById("settings-toggle-microphone").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockMicrophone)
        if (blockMicrophone) {
            chrome.contentSettings.microphone.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.microphone.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});


//Automatic downloads
document.getElementById("settings-toggle-automatic-downloads").addEventListener("click", function () {
    const blockAutomaticDownloads = document.getElementById("settings-toggle-automatic-downloads").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockAutomaticDownloads)
        if (blockAutomaticDownloads) {
            chrome.contentSettings.automaticDownloads.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.automaticDownloads.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});


// Location
document.getElementById("settings-toggle-location").addEventListener("click", function () {
    const blockLocation = document.getElementById("settings-toggle-location").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockLocation)
        if (blockLocation) {
            chrome.contentSettings.location.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.location.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});

// Notifications
document.getElementById("settings-toggle-notifications").addEventListener("click", function () {
    const blockNotifications = document.getElementById("settings-toggle-notifications").checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const parts = url.hostname.split(".");
        const domain = "https://*." + parts[parts.length - 2] + "." + parts[parts.length - 1] + "/*";
        console.log(domain, blockNotifications)
        if (blockNotifications) {
            chrome.contentSettings.notifications.set({
                primaryPattern: domain,
                setting: 'block'
            });
        } else {
            chrome.contentSettings.notifications.set({
                primaryPattern: domain,
                setting: 'allow'
            });
        }
    })
});

//////////////////
// Web requests //
//////////////////

let recordRequests = false

document.getElementById("requests-toggle-record").addEventListener("click", function () {
    recordRequests = document.getElementById("requests-toggle-record").checked;
});

let webRequests = {};

// Adds items to the table and expands to show headers and body when clicked
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (! recordRequests) {
            return
        }
        webRequests[details.requestId] = details;
        const table = document.getElementById("web-requests-table");
        const row = table.insertRow();
        row.id = details.requestId;
        const urlCell = row.insertCell();
        const methodCell = row.insertCell();
        const statusCell = row.insertCell();
        urlCell.textContent = details.url;
        methodCell.textContent = details.method;
        statusCell.textContent = "";
        // DETAILS ROW
        const detailsRow = table.insertRow(row.rowIndex + 1);
        const detailsCell = detailsRow.insertCell();
        detailsCell.classList.add("hidden");
        detailsCell.colSpan = 3;
        detailsCell.id = "details-" + details.requestId;
        row.addEventListener("click", function() {
            // if detailsCell is hidden, show it
            if (! detailsCell.classList.contains("hidden")) {
                detailsCell.classList.add("hidden");
            } else {
                detailsCell.classList.remove("hidden");
            }
        });
        // Generate Javascript code button
        const button = document.createElement("button");
        button.textContent = "Generate JS Code";
        detailsCell.appendChild(button);
        codeDiv = document.createElement("textarea");
        codeDiv.id = "code-div-" + details.requestId;
        codeDiv.style.width = "80vw";
        codeDiv.style.height = "60vh";
        codeDiv.classList.add("hidden");
        detailsCell.appendChild(codeDiv);


        button.addEventListener("click", function() {
            const cd = document.getElementById("code-div-" + details.requestId);
            if (! cd.classList.contains("hidden")) {
                cd.classList.add("hidden");
            } else {
                cd.classList.remove("hidden");
                details = webRequests[details.requestId];
                let code = `\nfetch("${details.url}", {\n`;
                code += `    method: "${details.method}",\n`;
                code += `    headers: {\n`;
                for (const header of details.requestHeaders) {
                    let headerName = header.name.replace(/"/g, '\\"');
                    let headerValue = header.value.replace(/"/g, '\\"');
                    code += `        "${headerName}": "${headerValue}",\n`;
                }
                code += `    },\n`;
                if (details.requestBody) {
                    if (details.requestBody.formData) {
                        const formData = details.requestBody.formData;
                        let formDataString = '';
                        for (const key in formData) {
                            formDataString += `${key}: ${formData[key]}, `;
                        }
                        code += `    body: '${formDataString}',\n`;
                    } else if (details.requestBody.raw) {
                        const decoder = new TextDecoder("utf-8");
                        const rawData = details.requestBody.raw[0].bytes;
                        const bodyText = decoder.decode(rawData);
                        code += `    body: '${bodyText}',\n`;
                    }
                }
                code += `})\n`;
                code += `.then(response => console.log(response))\n`;
                code += `.catch(error => console.error('Error:', error));\n`;
                
                cd.value = code;
                cd.style.width = "80vw";

                // Copy the code to clipboard by focusing on cd and executing document.execCommand('copy')
                cd.focus();
                document.execCommand('selectAll');
                document.execCommand('copy');
                showNotification("Copied to clipboard");
                cd.style.whiteSpace = 'pre-wrap'; // or 'pre-line'
            }
        });
        // Generate Python code button
        const pyButton = document.createElement("button");
        pyButton.textContent = "Generate Python Code";
        detailsCell.appendChild(pyButton);
        pyCodeDiv = document.createElement("textarea");
        pyCodeDiv.id = "py-code-div-" + details.requestId;
        pyCodeDiv.style.width = "80vw";
        pyCodeDiv.style.height = "60vh";
        pyCodeDiv.classList.add("hidden");
        detailsCell.appendChild(pyCodeDiv);

        pyButton.addEventListener("click", function() {
            const cd = document.getElementById("py-code-div-" + details.requestId);
            if (! cd.classList.contains("hidden")) {
                cd.classList.add("hidden");
            } else {
                cd.classList.remove("hidden");
                details = webRequests[details.requestId];
                let code = `import requests\n\n`;
                code += `url = "${details.url}"\n`;
                code += `headers = {\n`;
                for (const header of details.requestHeaders) {
                    let headerName = header.name.replace(/"/g, '\\"');
                    let headerValue = header.value.replace(/"/g, '\\"');
                    code += `    "${headerName}": "${headerValue}",\n`;
                }
                code += `}\n`;
                if (details.requestBody) {
                    if (details.requestBody.formData) {
                        const formData = details.requestBody.formData;
                        let formDataString = '';
                        for (const key in formData) {
                            formDataString += `${key}: ${formData[key]}, `;
                        }
                        code += `data = '${formDataString}'\n`;
                    } else if (details.requestBody.raw) {
                        const decoder = new TextDecoder("utf-8");
                        const rawData = details.requestBody.raw[0].bytes;
                        const bodyText = decoder.decode(rawData);
                        code += `data = '${bodyText}'\n`;
                    }
                }
                code += `response = requests.request("${details.method}", url, headers=headers, data=data)\n`;
                code += `print(response.status_code, response.text)\n`;
                
                cd.value = code;
                cd.style.width = "80vw";

                // Copy the code to clipboard by focusing on cd and executing document.execCommand('copy')
                cd.focus();
                document.execCommand('selectAll');
                document.execCommand('copy');
                showNotification("Copied to clipboard");
                cd.style.whiteSpace = 'pre-wrap'; // or 'pre-line'
            }
        });
        // Hint Text
        const br = document.createElement("br");
        detailsCell.appendChild(br);
        const hint = document.createElement("small");
        hint.textContent = "Click to expand";
        detailsCell.appendChild(hint)
        // REQUEST BODY
        const bodyDiv = document.createElement("div");
        const bodyLabel = document.createElement("h3");
        bodyLabel.textContent = "Request Body";
        bodyDiv.appendChild(bodyLabel);
        detailsCell.appendChild(bodyDiv);
        let body = null;

        // if bodyLabel is clicked, toggle body
        bodyLabel.addEventListener("click", function() {
            if (body) {
                body.remove();
                body = null;
            } else {
                body = document.createElement("div");
                body.style.width = "80vw";
                try {
                    const formData = details.requestBody.formData;
                    for (const key in formData) {
                        const p = document.createElement("p");
                        p.textContent = key + ": " + formData[key];
                        body.appendChild(p);
                    }
                    if (! formData) {
                        const decoder = new TextDecoder("utf-8");
                        const rawData = details.requestBody.raw[0].bytes;
                        const bodyText = decoder.decode(rawData);
                        body.textContent = bodyText;
                    }
                } catch (e) {
                    body.textContent = "No form data";
                }
                bodyDiv.appendChild(body);
            }
        });
        
    },
    {urls: ["<all_urls>"]},
    ["requestBody"]
);


// Use the ID to add the status code after onCompleted
chrome.webRequest.onSendHeaders.addListener(
    function(details) {
        if (! recordRequests) {
            return
        }
        webRequests[details.requestId].requestHeaders = details.requestHeaders;
        const row = document.getElementById(details.requestId);
        if (row) {
            row.cells[2].textContent = details.statusCode;
        }
        const detailsCell = document.getElementById("details-" + details.requestId);
        if (detailsCell) {
            const headersDiv = document.createElement("div");
            const headersLabel = document.createElement("h3");
            headersLabel.textContent = "Request Headers";
            headersDiv.appendChild(headersLabel);
            detailsCell.appendChild(headersDiv);
            let headers = null;
            headersLabel.addEventListener("click", function() {
                if (headers) {
                    headers.remove();
                    headers = null;
                } else {
                    headers = document.createElement("table");
                    const headersTableHeadersRow = headers.insertRow();
                    const headersTableHeadersCell1 = document.createElement("th");
                    const headersTableHeadersCell2 = document.createElement("th");
                    headersTableHeadersCell1.textContent = "Name";
                    headersTableHeadersCell2.textContent = "Value";
                    headersTableHeadersRow.appendChild(headersTableHeadersCell1);
                    headersTableHeadersRow.appendChild(headersTableHeadersCell2);
                    const headersTableBody = headers.createTBody();
                    details.requestHeaders.forEach(header => {
                        const headerRow = headersTableBody.insertRow();
                        const headerCell1 = headerRow.insertCell();
                        const headerCell2 = headerRow.insertCell();
                        headerCell1.textContent = header.name;
                        headerCell2.textContent = header.value;
                    });
                    headersDiv.appendChild(headers);
                }
            });
        }
    },
    {urls: ["<all_urls>"]},
    ["requestHeaders"]
);

// Use the ID to add the status code after onCompleted
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        if (! recordRequests) {
            return
        }
        //console.log(details);
        const row = document.getElementById(details.requestId);
        if (row) {
            row.cells[2].textContent = details.statusCode;
        }
        const detailsCell = document.getElementById("details-" + details.requestId);
        if (detailsCell) {
            const headersDiv = document.createElement("div");
            const headersLabel = document.createElement("h3");
            headersLabel.textContent = "Response Headers";
            headersDiv.appendChild(headersLabel);
            detailsCell.appendChild(headersDiv);
            let headers = null;
            headersLabel.addEventListener("click", function() {
                if (headers) {
                    headers.remove();
                    headers = null;
                } else {
                    headers = document.createElement("table");
                    const headersTableHeadersRow = headers.insertRow();
                    const headersTableHeadersCell1 = document.createElement("th");
                    const headersTableHeadersCell2 = document.createElement("th");
                    headersTableHeadersCell1.textContent = "Name";
                    headersTableHeadersCell2.textContent = "Value";
                    headersTableHeadersRow.appendChild(headersTableHeadersCell1);
                    headersTableHeadersRow.appendChild(headersTableHeadersCell2);
                    const headersTableBody = headers.createTBody();
                    details.responseHeaders.forEach(header => {
                        const headerRow = headersTableBody.insertRow();
                        const headerCell1 = headerRow.insertCell();
                        const headerCell2 = headerRow.insertCell();
                        headerCell1.textContent = header.name;
                        headerCell2.textContent = header.value;
                    });
                    headersDiv.appendChild(headers);
                }
            });
        }
    },
    {urls: ["<all_urls>"]},
    ["responseHeaders"]
);


// Use the input boxes to filter the web requests
/* <td><input id="requests-url-input"></td>
<td><input id="requests-method-input"></td>
<td><input id="requests-status-input"></td> */
document.getElementById("requests-url-input").addEventListener("keyup", function() {
    searchRequests();
});

document.getElementById("requests-method-input").addEventListener("keyup", function() {
    searchRequests();
});

document.getElementById("requests-status-input").addEventListener("keyup", function() {
    searchRequests();
});

function searchRequests() {
    // Searches requests for all three inputs
    const urlInput = document.getElementById("requests-url-input").value;
    const methodInput = document.getElementById("requests-method-input").value;
    const statusInput = document.getElementById("requests-status-input").value;
    const rows = document.getElementById("web-requests-table").rows;
    for (let i = 2; i < rows.length; i++) {
        try {
            if (rows[i].cells[0].textContent.includes(urlInput) && rows[i].cells[1].textContent.includes(methodInput) && rows[i].cells[2].textContent.includes(statusInput)) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        } catch (e) {
            console.log(e);
        }
    }
};

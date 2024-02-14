////////////////
// Page notes //
////////////////

document.getElementById('page-notes-textarea').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
    }
});

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
                data[key] = encrypt(value)
            } else {
                data[key] = value;
            }
            store("page-note-data", data)
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
    // Iterate through the keys of the dictionary
    // console.log(data)
    for (const key of Object.keys(data)) {
        if (isPattern) {
            if (url == key) {
                if (await getSetting("encrypt-page-notes")) {
                    return [key, decrypt(data[key])]; // Return the corresponding value
                } else {
                    return [key, data[key]]; // Return the corresponding value
                }
            }
        } else {
            const regexPattern = new RegExp(key);
            // Test if the variable matches the regex pattern
            if (regexPattern.test(url)) {
                if (await getSetting("encrypt-page-notes")) {
                    return [key, decrypt(data[key])]; // Return the corresponding value
                } else {
                    return [key, data[key]]; // Return the corresponding value
                }
                
            }
        }
    }
    console.log([defaultPattern(url), ""])
    return [defaultPattern(url), ""]; // Return null if no match is found
}

let data = {};
get("page-note-data").then((value) => {
    data = value || {};
  });

async function setActiveURL(url, isPattern=false) {
    keyTextArray = await checkMatch(url, isPattern=isPattern)
    console.log(keyTextArray)
    document.getElementById("url-pattern").value = keyTextArray[0]
    document.getElementById("page-notes-textarea").value = keyTextArray[1]
}

document.addEventListener("DOMContentLoaded", async function () {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    console.log(tab.url)
    setActiveURL(tab.url);
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
        matches = Object.entries(data).filter(([key, value]) => {
            // Check if the key or the value includes the searchKey
            return key.includes(searchKey) || (value !== null && value.toString().includes(searchKey));
        }).map(([key]) => key); // Extract the keys from the filtered array
    } else {
       matches = Object.keys(data).filter(key => key.includes(searchKey));
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
                valueCell.textContent = truncateText(decrypt(data[match]), 50);
            } else {
                valueCell.textContent = truncateText(data[match], 50);
            }
          valueCell.style="width: 60vw;"
          valueCell.classList.add("truncate")
          deleteCell.textContent = "X"
          //deleteCell.attributes.add("key_id", match)
          deleteCell.addEventListener("click", function () {
             delete data[match];
             store("page-note-data", data)
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
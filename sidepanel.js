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

async function checkMatch(url) {
    // Iterate through the keys of the dictionary
    console.log(data)
    for (const key of Object.keys(data)) {
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
    console.log([defaultPattern(url), ""])
    return [defaultPattern(url), ""]; // Return null if no match is found
}

let data = {};
get("page-note-data").then((value) => {
    data = value || {};
  });

async function setActiveURL(url) {
    keyTextArray = await checkMatch(url)
    console.log(keyTextArray)
    document.getElementById("url-pattern").value = keyTextArray[0]
    document.getElementById("page-notes-textarea").value = keyTextArray[1]
}

(async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    setActiveURL(tab.url);
  })();
  
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.active) {
      console.log("======= active tab url", tab.url);
      setActiveURL(tab.url);
    }
  });
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
      console.log("======= active tab url", tab.url);
      setActiveURL(tab.url);
    }
  });
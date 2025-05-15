///////////////////
// Custom Events //
///////////////////

document.addEventListener("DOMContentLoaded", function () {
    console.log("Fired DOMContentLoaded")
    // Set a timeout to trigger the custom event after 2 seconds
    setTimeout(() => {
        // Create the custom event
        const customEvent = new Event('DOMContentModified');
        console.log("Firing DOMContentModified")
        // Dispatch the custom event
        document.dispatchEvent(customEvent);
    }, 1000); // 2000 milliseconds = 2 seconds
  });

// Function to dispatch the custom 'tabsChanged' event
function dispatchTabsChangedEvent(tab) {
    const tabsChangedEvent = new CustomEvent('tabsChanged', { detail: { tab } });
    document.dispatchEvent(tabsChangedEvent);
}

// Listen for tab activation and update events
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    dispatchTabsChangedEvent(tab);  // Dispatch the custom event
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    dispatchTabsChangedEvent(tab);  // Dispatch the custom event
});


// If I use optional permissions, consider:
//chrome.permissions.contains({ permissions: ['topSites'] }).then((result) => { if (result) {

///////////////////
// Set Variables //
///////////////////

let createPw = false

const variables = {
    extensionName: "Page Notes",
    extensionShortName: "PN",
    clipboardName: "Clipbox",
    snippetsName: "Snippets",
    pageNotesName: "Page Notes",
    settingsName: "Settings",
    aboutName: "Getting Started",
    regexName: "Regex",
    regexTesterName: "Regex Tester",
    replacerName: "Re-placer",
    htmlName: "Html",
    pwGeneratorName: "Password Generator",
    ppGeneratorName: "Pass Phrases",
    generatorName: "Generator",
    cookiesName: "Cookies",
    pageSettingsName: "Site Settings",
    webRequestsName: "Requests",
    referencesName: "References",
    scriptName: "Script",
    regexSearchName: "re-Search",
    tocName: "TOC", 
    webAppSecName: "WebAppSec"
  }

/////////////////
// Lock/Unlock //
/////////////////

async function checkIfNoAccount() {
    if (await get("hashValidation") == undefined) {
        console.log("No password")
        // Change prompt
        createPw = true
        document.querySelector('label[for="password"]').textContent = "Create a password:"
    } else {
        console.log("Password exists")
    }
}

async function getValidationSalt() {
    var salt = await get("enlace-vs")
    if (salt === undefined) {
        console.log("Generating Validation Salt")
        salt = generateRandomAlphaNumeric(10)
        store("enlace-vs", salt)
    }
    return salt
}

async function getStorageSalt() {
    var salt = await get("enlace-ss")
    if (salt === undefined) {
        console.log("Generating Storage Salt")
        salt = generateRandomAlphaNumeric(10)
        store("enlace-ss", salt)
    }
    return salt
}

function lock() {
    chrome.storage.session.set({"en_locked": true});
    showhide("locked-div");
    showhide("unlocked-div");
}


async function unlock(key) {
    const hashValidation = await hashString(key + await getValidationSalt())
    if (hashValidation == await get("hashValidation")) {
        // Store for unlocking
        const hashKey = await hashString(key + await getStorageSalt())
        chrome.storage.session.set({"en_locked": hashKey});
        runOnUnlock()
    } else {
        showNotification("Incorrect password")
    }
}


async function onStart() {
    if (! await isLocked()) {
        runOnUnlock()

    } else {
        const inputBox = document.getElementById("password");
        inputBox.focus();
    }
}

async function runOnUnlock() {
    console.log("Unlocked")
    // Send the event
    const event = new Event('EnlaceUnlocked');
    document.dispatchEvent(event);
    // Handles the HTML
    showhide("locked-div");
    showhide("unlocked-div");
    document.getElementById("password").value = "";

    // Send message to service worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'appStateChanged',
            isUnlocked: true
        });
    } else {
        console.log("Service worker controller is not available.");
        navigator.serviceWorker.ready.then(function(registration) {
            registration.active.postMessage({
                action: 'appStateChanged',
                isUnlocked: true
            });
        }).catch(function(error) {
            console.error("Failed to send message to service worker:", error);
        });
    }
}

async function setPassword(key) {
    // They will not be able to unencrypt already encrypted items
    console.log("Setting pw")
    const hashValidation = await hashString(key + await getValidationSalt())
    store("hashValidation", hashValidation)
}

///////////////
// HTML util //
///////////////

// Show/Hide 
function showhide(hideId) {
    var div = document.getElementById(hideId);
    div.classList.toggle('hidden'); 
  }

function changeTabs(button) {
    return function() {
        const tabButtons = document.querySelectorAll(".tab-button");
        // Remove 'active' class from all tab buttons
        tabButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        // Add 'active' class to the clicked tab button
        button.classList.add("active");

        // Get the ID of the tab to show
        const tabId = button.getAttribute("data-tab");

        // Hide all tab contents
        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach(function (content) {
            content.classList.remove("active");
        });

        // Show the tab content with the corresponding ID
        const tabContentToShow = document.getElementById(tabId);
        tabContentToShow.classList.add("active");
    };
}

async function copyValue(element) {
    try {
        // Check if Clipboard API is available
        if (!navigator.clipboard) {
            console.error("Clipboard API is not available.");
            showNotification("Clipboard API is not supported by this browser.");
            return;
        }

        // Concatenate value and innerText if they exist
        const textToCopy = (element.value || '') + (element.innerText || '');

        await navigator.clipboard.writeText(textToCopy);
        console.log("Content copied!");
        showNotification("Content Copied");
    } catch (error) {
        console.error("Failed to copy content: ", error);
        showNotification("Failed to copy content");
    }
}


async function pasteValue(element) {
    const text = await navigator.clipboard.readText();
    element.value = text;
    showNotification("Pasted");
}

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    for (const v in variables) {
        Array.from(document.getElementsByClassName(v)).forEach(element => {
            element.innerHTML = variables[v];
        });
    }

    onStart()

    // Add Keyboard Shortcuts
    chrome.commands.getAll(function(commands) {
        commands.forEach(function(command) {
            // console.log('Command: ' + command.name);
            // console.log('Shortcut: ' + command.shortcut);
            Array.from(document.getElementsByClassName(command.name)).forEach(element => {
                if (element && command.shortcut) {
                    element.innerHTML = command.shortcut
                }
            });
        });
    });

    /////////////////
    // Tab buttons //
    /////////////////

    // Get all tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");
    // Add click event listener to each tab button
    tabButtons.forEach(function (button) {
        button.addEventListener("click", changeTabs(button));
    });

    const subtabButtons = document.querySelectorAll(".subtab-button");
    subtabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Get the subtab group from the clicked button
            const group = button.getAttribute("group");

            // Filter tab buttons by group
            const groupButtons = document.querySelectorAll(`.subtab-button[group="${group}"]`);

            // Remove 'active' class from all tab buttons in that group
            groupButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            // Add 'active' class to the clicked tab button
            button.classList.add("active");

            // Get the ID of the tab to show
            const tabId = button.getAttribute("data-tab");

            // Filter tab contents by group
            const groupContents = document.querySelectorAll(`.subtab-content[group="${group}"]`);

            // Hide all tab contents of that group
            groupContents.forEach(function (content) {
                content.classList.remove("active");
            });

            // Show the tab content with the corresponding ID
            const tabContentToShow = document.getElementById(tabId);
            tabContentToShow.classList.add("active");
        });
    });

    // If no account
    checkIfNoAccount()

    // Enter password on "Enter"
    document.getElementById("password").addEventListener('keydown', async function(event) {
        if (event.key === 'Enter') {
            if (document.getElementById('set-reset-pw').checked | createPw) {
                await setPassword(document.getElementById("password").value)
                await unlock(document.getElementById("password").value)
                document.getElementById('set-reset-pw').checked = false
                createPw = false
            } else {
                await unlock(document.getElementById("password").value)
            }
        }
    });

    // Lock
    document.getElementById("lock-button").addEventListener('click', async function () {
        lock()
    })
    
});

////////////////////////
// DOMContentModified //
////////////////////////

document.addEventListener("DOMContentModified", function() {
    console.log("Running 'DOMContentModified' actions")
    
    // Copy on Click
    const copyOnClickElements = document.querySelectorAll('.copy-on-click');
    // Loop through each element and add a click event listener
    copyOnClickElements.forEach(button => {
        button.addEventListener('click', function() {       
            // Copy the text content of the clicked element to the clipboard
            copyValue(this);
        });
    });


    // Copy Buttons
    var copy_blocks = document.querySelectorAll(".copy-block");
    copy_blocks.forEach(function(copy_block) {

        var copyBtn = document.createElement("button");

        copyBtn.innerHTML =
        '<img style="height: 15px;" src="images/copy-icon.svg" alt="Icon"></img>';
        copyBtn.style =
        "float: right; margin-left: 10px; font-size: 15px; padding: 1px; vertical-align: top;";
        copy_block.parentNode.insertBefore(copyBtn, copy_block.nextSibling); // Insert the button after the code block

        copyBtn.addEventListener("click", function () {
            copyValue(copy_block)
        });
    });

    // Hover over help Text
   
        var tooltips = document.querySelectorAll('[hover-text]');

        tooltips.forEach(function (tooltip) {
            tooltip.classList.add('hover-text-trigger')
            var tooltipText = tooltip.getAttribute('hover-text');
            var tooltipElement = document.createElement('div');
            tooltipElement.classList.add('tooltiptext');
            tooltipElement.textContent = tooltipText;
            tooltip.appendChild(tooltipElement);
        });
  

    // Show Hide Class on Click
    Array.from(document.querySelectorAll("[show-hide-class-on-click]")).forEach(element => {
        element.addEventListener("click", function() {
            Array.from(document.getElementsByClassName(element.getAttribute("show-hide-class-on-click"))).forEach(element => {
                element.classList.toggle("hidden")
                console.log("toggled")
            });
        });
    });

    // Function to toggle dropdown content visibility
    function toggleDropdown() {
        // Toggle the 'undropped' class on the clicked button
        this.classList.toggle("undropped");

        // Find the associated dropdown content
        const dropdownContent = this.nextElementSibling;

        // Toggle the 'hidden' class on the associated dropdown content
        dropdownContent.classList.toggle('hidden');
    }

    // Event listeners for all dropdown buttons
    const dropdownButtons = document.querySelectorAll('.dropdown-button');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', toggleDropdown);
    });

});

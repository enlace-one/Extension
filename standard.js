
//chrome.permissions.contains({ permissions: ['topSites'] }).then((result) => { if (result) {

// Set Variables
const variables = {
    extensionName: "Enlace Assistant",
    clipboardName: "Clipboard",
    snippetsName: "Snippets",
    pageNotesName: "Page Notes",
    settingsName: "Settings",
    aboutName: "Getting Started"
  }
  
window.addEventListener("DOMContentLoaded", function() {
for (const v in variables) {
    Array.from(document.getElementsByClassName(v)).forEach(element => {
        element.innerHTML = variables[v];
    });
}
});


// Lock/Unlock
const validation_salt = "Validation129"
const storage_salt = "Enlsal294"

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
        console.log("Incorrect password")
    }
}

// Show/Hide 
function showhide(hideId) {
    var div = document.getElementById(hideId);
    div.classList.toggle('hidden'); 
  }

window.addEventListener("DOMContentLoaded", function() {
    Array.from(document.getElementsByClassName("hide-trigger")).forEach(element => {
        element.addEventListener("click", function() {
            
            Array.from(document.getElementsByClassName(element.getAttribute("hide-class"))).forEach(element => {
                element.classList.add("hidden")
            });

            showhide(element.getAttribute("hide-id"))
        });
    });
});

// JavaScript code to handle tab switching
document.addEventListener("DOMContentLoaded", function () {
    // Get all tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");

    // Add click event listener to each tab button
    tabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
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
        });
    });
});

// Hover over help Text
document.addEventListener('DOMContentLoaded', function () {
    var tooltips = document.querySelectorAll('[hover-text]');

    tooltips.forEach(function (tooltip) {
        tooltip.classList.add('hover-text-trigger')
        var tooltipText = tooltip.getAttribute('hover-text');
        var tooltipElement = document.createElement('div');
        tooltipElement.classList.add('tooltiptext');
        tooltipElement.textContent = tooltipText;
        tooltip.appendChild(tooltipElement);
    });
});


async function onStart() {
    if (! await isLocked()) {
        runOnUnlock()

    } else {
        const inputBox = document.getElementById("password");
        inputBox.focus();
    }
}

onStart()


// Enter password on "Enter"
document.getElementById("password").addEventListener('keydown', async function(event) {
    if (event.key === 'Enter') {
        if (document.getElementById('set-reset-pw').checked) {
            await setPassword(document.getElementById("password").value)
            await unlock(document.getElementById("password").value)
            document.getElementById('set-reset-pw').checked = false
        } else {
            await unlock(document.getElementById("password").value)
        }
    }
});

document.getElementById("lock-button").addEventListener('click', async function () {
    lock()
})


async function runOnUnlock() {
    console.log("Unlocked")
    // Send the event
    const event = new Event('EnlaceUnlocked');
    document.dispatchEvent(event);
    // Handles the HTML
    showhide("locked-div");
    showhide("unlocked-div");
    document.getElementById("password").value = "";
}

async function setPassword(key) {
    // They will not be able to unencrypt already encrypted items
    console.log("Setting pw")
    const hashValidation = await hashString(key + await getValidationSalt())
    store("hashValidation", hashValidation)
}

// Add Keyboard Shortcuts
chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
        console.log('Command: ' + command.name);
        console.log('Shortcut: ' + command.shortcut);
        Array.from(document.getElementsByClassName(command.name)).forEach(element => {
            if (element && command.shortcut) {
                element.innerHTML = command.shortcut
            }
        });
    });
});
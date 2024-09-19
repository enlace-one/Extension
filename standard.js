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
        const dataTabClass = button.getAttribute("data-tab");

        // Hide all tab contents
        const tabContents = document.querySelectorAll(".tab-content");
        tabContents.forEach(function (content) {
            content.classList.remove("active");
        });

        // Show the tab content with the corresponding ID
        const tabContentToShow = document.getElementsByClassName(dataTabClass);
        const tabContentArray = Array.from(tabContentToShow);

        // Iterate over each element and add the "active" class
        tabContentArray.forEach(element => {
            element.classList.add("active");
        });
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
    /////////////////
    // Tab buttons //
    /////////////////

    // Get all tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");
    // Add click event listener to each tab button
    tabButtons.forEach(function (button) {
        button.addEventListener("click", changeTabs(button));
    });
    
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
        '<img style="height: 15px;" src="images/copy.svg" alt="Icon"></img>';
        copyBtn.style =
        "float: right; margin-left: 10px; font-size: 15px; padding: 1px; vertical-align: top;";
        copy_block.parentNode.insertBefore(copyBtn, copy_block.nextSibling); // Insert the button after the code block

        copyBtn.addEventListener("click", function () {
            copyValue(copy_block)
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

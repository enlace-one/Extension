//////////////
// SETTINGS //
//////////////

// Default Settings
for (const key in default_settings) {
    const value = default_settings[key];
    // Set the value of the element with key as its ID
    const element = document.getElementById(key);
    if (element && element.type === "checkbox") {
        if (value) {
            element.checked = true 
        } else {
            element.checked = false
        }
    } else if (element) {
        element.value = value
    }
}

// Save
document.getElementById("save_settings").addEventListener("click", function() {
    for (let key in default_settings) {
        const value = default_settings[key];
        // Set the value of the element with key as its ID
        const element = document.getElementById(key);
        if (element && element.type === "checkbox") {
            if (element.checked) {
                storeSetting(key, true)
            } else {
                storeSetting(key, false)
            }
        } else if (element) {
            storeSetting(key, value)
        }
    }
    showNotification("Saved")
});

document.getElementById("reset-settings").addEventListener("click", function (){
    store("enlace-settings", {})
})

document.getElementById("reset-snippets").addEventListener("click", function (){
    store("snippet-data", {})
})

document.getElementById("reset-page-notes").addEventListener("click", function (){
    store("page-note-data", {})
})

document.getElementById("reset-clipboard").addEventListener("click", function (){
    chrome.commands.getAll(function(commands) {
        commands.forEach(function(command) {
            if (command.name.startsWith("copy-value")) {
                store(command.name, "")
            }
        });
    });
})
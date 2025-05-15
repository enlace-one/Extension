console.log('Executing popup.js');

///////////////
// Clipboard //
///////////////


// Add Keyboard Shortcuts
chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
        console.log('Command: ' + command.name);
        console.log('Shortcut: ' + command.shortcut);
        const element = document.getElementById(command.name + "-label")
        if (element && command.shortcut) {
            element.innerHTML = command.shortcut + " copies:"
        }
    });
});

onStartSpecific()

let clipboardComponentsAdded = false


async function clipEditPopUpForm(defaultName = '', defaultInputType = 'text', id, callback) {
  // Remove any existing form before creating a new one
  const existingForm = document.getElementById("clipEditForm");
  if (existingForm) {
    existingForm.remove();
  }

  // Create a form element
  const form = document.createElement('form');
  form.id = "clipEditForm"; // Assign ID for easier cleanup
  form.style.position = 'fixed';
  form.style.top = '50%';
  form.style.left = '50%';
  form.style.transform = 'translate(-50%, -50%)';
  form.style.padding = '20px';
  form.style.backgroundColor = '#fff';
  form.style.border = '1px solid #ccc';
  form.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

  // Create input for name
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name: ';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = defaultName;
  nameLabel.appendChild(nameInput);
  form.appendChild(nameLabel);

  // Create select for input type
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Input Type: ';
  const typeSelect = document.createElement('select');
  const options = ['text', 'password', 'textarea'];
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    if (option === defaultInputType) {
      opt.selected = true;
    }
    typeSelect.appendChild(opt);
  });
  typeLabel.appendChild(typeSelect);
  form.appendChild(typeLabel);

  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit';
  form.appendChild(submitButton);

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  form.appendChild(cancelButton);

  cancelButton.onclick = () => form.remove();

  // Append form to body
  document.body.appendChild(form);

  // Handle form submission
  form.addEventListener('submit', (event) => {
    if (event.defaultPrevented) {
      console.log('Submit event was canceled.', event.data);
      return;
    }
    event.preventDefault();
    const name = nameInput.value;
    const inputType = typeSelect.value;
    console.log(`Name: ${name}, Input Type: ${inputType}`);

    try {
      callback(name, inputType, id);
    } catch (error) {
      console.error("Callback Error:", error);
    }

    // Ensure form is removed after submission
    form.remove();
    // Reload html to update
    location.reload();
  });
}

function addClipboardComponenets() {
  if (clipboardComponentsAdded) {
    return
  }
  clipboardComponentsAdded = true
  console.log("triggered unlock stuff ")
    const copy_html = '<button id="copy-{ID}" style="width: 8vw;"><img style="width: 100%; height: auto;" src="images/copy-icon.svg" alt="Icon"></button>'
    const paste_html = '<button id="paste-{ID}" style="width: 8vw;"><img style="width: 100%; height: auto;" src="images/paste-icon.svg" alt="Icon"></button>'
    const edit_html = `<button id="edit-{ID}" style="width: 8vw;"><img style="width: 
    100%; height: auto;" src="images/edit-icon.svg" alt="Icon"></button>`

    Array.from(document.getElementsByClassName("store-input-value")).forEach(async element => {
        const clipId = element.getAttribute("key")
        const clipName = await get(clipId + "-name", "")
        const clipInputType = await get(clipId + "-input-type", "text")

        const nameSmall = document.createElement("small")
        nameSmall.innerText = clipName
        nameSmall.style="width:100%"
        element.parentElement.insertAdjacentElement('beforebegin', nameSmall)

        if (clipInputType === "textarea") {
          const textarea = document.createElement("textarea");
          textarea.value = element.value; // Preserve existing value
          textarea.key = element.key; // Preserve existing value
          textarea.id = element.id; // Preserve ID if needed
          textarea.className = element.className; // Preserve classes if applicable
          textarea.rows = 3
          textarea.style = element.style
          element.replaceWith(textarea); // Replace input with textarea
          element = textarea
        } else {
          element.type = clipInputType; // Correct way to change input type
        }

        try {
            if (await getSetting("encrypt-clipboard")) {
                element.value = await eGet(clipId)
            } else {
                element.value = await get(clipId)
            }
        } catch {
            console.log("No found value stored for " + clipId)
        }
        async function saveClipBoard() {
          console.log("triggered input onchange")
           
          navigator.serviceWorker.controller.postMessage({
              action: 'appStateChanged',
              hasChanged: true
          });
          if (await getSetting("encrypt-clipboard")) {
              eStore(clipId, element.value)
          } else {
              store(clipId, element.value)
          }
          showNotification("Saved")
      }
        element.addEventListener("change", saveClipBoard);

        // Add copy/paste button after the variable element
        const copyButton = copy_html.replace("{ID}", clipId);
        const pasteButton = paste_html.replace("{ID}", clipId);
        const editButton = edit_html.replace("{ID}", clipId);
        element.insertAdjacentHTML('afterend', copyButton + pasteButton + editButton);

        // Add event listeners for the copy and paste buttons
        document.getElementById("copy-" +clipId).addEventListener("click", function() {
          let originalType = element.type;
          if (originalType === "password") {
              element.type = "text"; // Temporarily change to text
          }
      
          element.select();
          document.execCommand("copy");
      
          if (originalType === "password") {
              element.type = "password"; // Revert back to password
          }
      
          showNotification("Copied");
        });
        document.getElementById("paste-" + clipId).addEventListener("click", async function() {
            const text = await navigator.clipboard.readText();
            element.value = text;
            showNotification("Pasted");
            saveClipBoard();
        });
        document.getElementById("edit-" + clipId).addEventListener("click", async function() {
          async function updateSettings(name, inputType, clipId) {
            store(clipId + "-name", name)
            store(clipId + "-input-type", inputType)
          }
          await clipEditPopUpForm(clipName, clipInputType, clipId, updateSettings)
      });

    });

}

// Store new keys and set value. Select "Search" input box.
document.addEventListener("EnlaceUnlocked", async function() {
    addClipboardComponenets()
});

// This is to combat the trouble with loading sometimes seen in edge
isLocked().then((value) => {
 if (! value) {
    addClipboardComponenets()
 }
})



//////////////
// SNIPPETS //
//////////////


async function onStartSpecific() {
    if (! await isLocked()) {
        const inputBox = document.getElementById("search");
        inputBox.focus();
    }
}

let data = {};
get("snippet-data").then((value) => {
    data = value || {};
  });


  let searchTimeout;
  let highlightedIndex = -1;

  document.getElementById('key').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
    }
  });
  document.getElementById('value').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      storeKeyValue();
    }
  });
  document.getElementById('search').addEventListener('input', handleSearchInput);
  document.getElementById('search').addEventListener('keydown', handleResultKeyDown);

  async function storeKeyValue() {
    const keyInput = document.getElementById('key');
    const valueInput = document.getElementById('value');
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
        if (key.length > await getSetting("max-key-char-snippets")) {
            showNotification("Key is too long")
            return ""
        } else if (value.length > await getSetting("max-value-char-snippets")) {
            showNotification("Value is too long")
            return ""
        } else {
            if (await getSetting("encrypt-snippets")) {
                data[key] = encrypt(value)
            } else {
                data[key] = value;
            }
            store("snippet-data", data)
            keyInput.value = '';
            valueInput.value = '';
            showNotification("Stored value for '" + key +"'")
        }
    } else {
      showNotification("Error: Enter Key and value first")
    }
    
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchKeyValue, 500);
  }

  function searchKeyValue() {
    const searchKey = document.getElementById('search').value.trim();
    const resultTable = document.getElementById('result');
    resultTable.innerHTML = '';
    if (searchKey) {
      const matches = Object.keys(data).filter(key => key.startsWith(searchKey));
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
          keyCell.id = match
          if (await getSetting("encrypt-snippets")) {
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
             store("snippet-data", data)
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
    }
  }

  async function handleResultKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const rows = document.querySelectorAll('#result tbody tr');
      if (rows.length > 0) {
        if (event.key === "ArrowDown") {
          highlightedIndex = (highlightedIndex + 1) % rows.length;
        } else if (event.key === "ArrowUp") {
          highlightedIndex = (highlightedIndex - 1 + rows.length) % rows.length;
        }
        rows.forEach((row, index) => {
          if (index === highlightedIndex) {
            row.classList.add('highlighted');
          } else {
            row.classList.remove('highlighted');
          }
        });
      }
    } else if (event.key === "Enter" && highlightedIndex !== -1) {
      const selectedKey = document.querySelectorAll('#result tbody tr')[highlightedIndex].cells[0].id;
      //const selectedValue = document.querySelectorAll('#result tbody tr')[highlightedIndex].cells[1].textContent;
        //   document.getElementById('key').value = selectedKey.trim();
        //   document.getElementById('value').value = selectedValue.trim();
        if (await getSetting("encrypt-snippets")) {
            navigator.clipboard.writeText(decrypt(data[selectedKey]));
        } else {
            navigator.clipboard.writeText(data[selectedKey]);
        }
        //navigator.clipboard.writeText(selectedValue);
        showNotification("Coped value for '" + selectedKey +"'")
        document.getElementById("search").value = ""
    }
  }
  
//////////////////////////////
// Handle Bottom Button Bar //
//////////////////////////////
  


// In your popup script (popup.js):

document.getElementById('openOptionsPage').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});
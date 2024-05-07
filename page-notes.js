// Houses common functions for both sidepanel.js and options.js

function insertTextAtCursor(text) {
  const pos = easyMDE.codemirror.getCursor();
  easyMDE.codemirror.setSelection(pos, pos);
  easyMDE.codemirror.replaceSelection(text);
  // Move the cursor to the end of the inserted text
  easyMDE.codemirror.setCursor({ line: pos.line, ch: pos.ch + text.length });
}

////////////////
// Page notes //
////////////////

function get_default_pattern(url) {
  if (url === undefined) {
    url = "";
  }
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  if (url.includes("#")) {
    url = url.split("#")[0];
  }
  const escapedString = escapeRegExp(url);
  console.log("returning " + escapedString);
  return escapedString;
}

function get_default_title(url) {
  let title = "";
  if (url === undefined) {
    title = "";
  } else {
    try {
      title = url.split("/")[2];
    } catch {
      console.log(`Failed to get domain from ${url}`);
    }
  }
  return title;
}

function noteIsExpired(note) {
  if (!note.lastOpened) {
    // Non-Expiring Notes
    return false;
  }
  const expiryDuration = 60 * (24 * 60 * 60 * 1000); // 60 days in milliseconds
  const lastOpenedTime = new Date(note.lastOpened).getTime();
  const currentTime = Date.now();
  return currentTime - lastOpenedTime > expiryDuration;
}

async function deleteExpiredNotes() {
  const results = await chrome.storage.sync.get();
  for (let key in results) {
    let note = results[key];
    if (key.startsWith("mde_")) {
      if (noteIsExpired(note)) {
        delete_page_note(key);
      }
    }
  }
}

/////////////
// Easymde //
/////////////

// https://github.com/Ionaru/easy-markdown-editor?tab=readme-ov-file#install-easymde

const viewPortWidth = window.innerWidth;
let easyMDE;
let pageNoteConfigOverwrite;
let openInPreview; //= pageNoteConfigOverwrite.openInPreview;
let openInFullScreen; // = pageNoteConfigOverwrite.openInFullScreen;
let expiringCheckbox;

async function getEasyMDE() {
  let customPageNoteJson = {};

  get("page-note-json").then((value) => {
    if (value != "" && value != null && value != 0 && value != undefined) {
      customPageNoteJson = value;
    }

    pageNoteConfigOverwrite = {
      ...defaultPageNoteConfig, // start with the default in case custom deletes some
      ...customPageNoteJson, // Make any custom edits
      ...{
        element: document.getElementById("page-notes-textarea"), // Overwrite what needs to be there
      },
    };

    console.log(pageNoteConfigOverwrite);

    if (viewPortWidth > 500 && viewPortWidth < 901) {
      pageNoteConfigOverwrite["toolbar"] = [
        "bold",
        "italic",
        "strikethrough",
        "heading",
        "code",
        "quote",
        "ordered-list",
        "unordered-list",
        "clean-block",
        "horizontal-rule",
        "undo",
        "redo",
        "link",
        "image",
        "preview",
        "side-by-side",
        "fullscreen",
        "guide",
        "table",
      ];
    } else if (viewPortWidth > 900) {
      pageNoteConfigOverwrite["toolbar"] = [
        "bold",
        "italic",
        "strikethrough",
        "heading",
        "heading-1",
        "heading-2",
        "heading-3",
        "code",
        "quote",
        "ordered-list",
        "unordered-list",
        "clean-block",
        "horizontal-rule",
        "undo",
        "redo",
        "link",
        "image",
        "preview",
        "side-by-side",
        "fullscreen",
        "guide",
        "table",
      ];
    } else {
      pageNoteConfigOverwrite["toolbar"].push({
        name: "OpenInTab",
        action: (editor) => {
          const pageNoteId = idElement.value;
          const url = chrome.runtime.getURL("options.html") + "#" + pageNoteId;
          chrome.tabs.create({ url: url });
        },
        className: '<i class="fa-regular fa-window-maximize"></i>',
        text: "O",
        title: "Open in Tab",
        attributes: {
          // for custom attributes
          id: "open-in-tab",
          // "data-value": "custom value" // HTML5 data-* attributes need to be enclosed in quotation marks ("") because of the dash (-) in its name.
        },
      });
    }

    console.log(pageNoteConfigOverwrite);

    easyMDE = new EasyMDE(pageNoteConfigOverwrite);
    easyMDE.codemirror.on("change", saveNoteTimeOut);

    // EXPIRATION
    expiringSpan = document.querySelector(".expiring:not(.checkbox-added)");
    expiringSpan.classList.add("checkbox-added");
    expiringSpan.innerHTML = `<div style="display: flex; align-items: center;">
      <input id="page-notes-expiring-checkbox" type="checkbox"/>
      <label for="page-notes-expiring-checkbox">Expiring </label>
      <p hover-text="When checked, the page note expires after 60 days without views or edits.">&nbsp; (i)</p>
    </div>`;
    expiringCheckbox = document.getElementById(
      "page-notes-expiring-checkbox"
    );
    

    openInPreview = pageNoteConfigOverwrite.openInPreview;
    openInFullScreen = pageNoteConfigOverwrite.openInFullScreen;

    document
      .querySelector(".EasyMDEContainer")
      .addEventListener("keydown", async function (event) {
        if (event.ctrlKey && event.key === ";") {
          console.log("Adding current date/time");
          event.preventDefault();
          let currentDate = new Date();
          let options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          };
          let formattedDate = currentDate.toLocaleString("en-GB", options);
          insertTextAtCursor(formattedDate);
        } else if (event.ctrlKey && event.key === ":") {
          event.preventDefault();
          console.log("Adding current url");
          let url = await getCurrentURL();
          url = "[title](" + url + ")";
          insertTextAtCursor(url);
        } else if (event.ctrlKey && event.key === "s") {
          event.preventDefault();
          downloadPageNote();
        }
      });

    // END of easyMDE def.
  });
}

getEasyMDE();

//////////////
// ELEMENTS //
//////////////

const urlPatternElement = document.getElementById("url-pattern");
const titleElement = document.getElementById("page-notes-title");
const idElement = document.getElementById("page-note-id");
const pageNotesTabButton = document.getElementById("page-notes-tab-button");
const savedAtIndicator = document.querySelector(".autosave"); //getElementById("page-notes-saved-at")

let encryptPageNotes = false;
getSetting("encrypt-page-notes").then((value) => {
  encryptPageNotes = value;
});

let displayFullTable = false;
let thoroughSearch = false;

////////////////
// EXPIRATION //
////////////////

// Run the deleteExpiredNotes function every 100 times this is called
const randomNumber = Math.floor(Math.random() * 60) + 1;
if (randomNumber === 50) {
  deleteExpiredNotes();
}

//////////
// SAVE //
//////////

async function _save_page_note(id, note, title, url_pattern, expiring) {
  if (encryptPageNotes) {
    note = await encrypt(note);
  }
  const noteData = {
    note: note,
    title: title,
    url_pattern: url_pattern,
    id: id,
  };
  if (expiring) {
    noteData["lastOpened"] = new Date().toISOString();
  }
  store(id, noteData);
  console.log(`Note saved with ID: ${id}`);
}

async function savedAtBanner() {
  savedAtIndicator.innerText = "Saved.";
  setTimeout(function () {
    savedAtIndicator.innerText = "";
  }, 1000);
}

async function save_page_note() {
  const url = urlPatternElement.value;
  const title = titleElement.value;
  const id = idElement.value;
  const note = await easyMDE.value();
  const expiring = expiringCheckbox.checked;
  _save_page_note(id, note, title, url, expiring);
  savedAtBanner();
}

let saveTimeout;

function saveNoteTimeOut() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    save_page_note();
  }, 1500);
}

titleElement.addEventListener("change", saveNoteTimeOut);

urlPatternElement.addEventListener("change", saveNoteTimeOut);

/////////
// GET //
/////////

async function get_page_note(id) {
  page_note = await get(id);
  if (encryptPageNotes) {
    page_note.note = await decrypt(page_note.note);
  }
  return page_note;
}

async function open_page_note(id) {
  console.log(`Opening page note ${id}`);

  const page_note = await get_page_note(id);

  console.log(page_note);

  // Set Values
  easyMDE.value(page_note.note);
  urlPatternElement.value = page_note.url_pattern;
  titleElement.value = page_note.title;
  idElement.value = id;

  setTimeout(function () {
    if (page_note.lastOpened) {
      expiringCheckbox.checked = true;
    } else {
      expiringCheckbox.checked = false;
    }
  }, 1000);

  // Set Visibility
  pageNotesTabButton.classList.remove("hidden");
  pageNotesTabButton.click();
  easyMDE.codemirror.refresh();

  // Set options
  if (openInFullScreen) {
    easyMDE.toggleFullScreen();
  }
  if (openInPreview) {
    easyMDE.togglePreview();
  }
}

////////////
// DELETE //
////////////

async function delete_page_note(id) {
  await chrome.storage.sync.remove(id);
}

////////////
// SEARCH //
////////////

async function _search_page_note(term) {
  const filteredNotes = [];
  const lowerCaseTerm = term.toLowerCase();

  const results = await chrome.storage.sync.get();
  for (let key in results) {
    let note = results[key];
    if (key.startsWith("mde_")) {
      if (note.title.toLowerCase().includes(lowerCaseTerm)) {
        filteredNotes.push(note);
      } else if (thoroughSearch) {
        if (note.url_pattern.toLowerCase().includes(lowerCaseTerm)) {
          filteredNotes.push(note);
        } else if (!encryptPageNotes) {
          if (note.note.toLowerCase().includes(lowerCaseTerm)) {
            filteredNotes.push(note);
          }
        }
      }
    }
  }
  return filteredNotes;
}

async function search_page_notes() {
  const term = document.getElementById("page-notes-search").value;
  const table = document.getElementById("page-notes-result-table");
  table.innerHTML = "";

  const page_notes = await _search_page_note(term);
  console.log("Searched. Page notes returned ", page_notes.length);

  if (page_notes.length > 0) {
    document
      .getElementById("no-search-results-page-notes")
      .classList.add("hidden");
    makePageNoteTable(page_notes, table);
  } else {
    document
      .getElementById("no-search-results-page-notes")
      .classList.remove("hidden");
  }
}

document
  .getElementById("page-notes-search")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action to avoid any unwanted behavior (like form submission)
      search_page_notes();
    }
  });

////////////////////
// AUTO MATCH URL //
////////////////////

async function get_matching_page_notes(url) {
  const matchingNotes = [];

  const results = await chrome.storage.sync.get();
  for (key in results) {
    let result = results[key];
    if (key.startsWith("mde_")) {
      if (result.url_pattern != "") {
        if (new RegExp(result.url_pattern).test(url)) {
          result["id"] = key;
          matchingNotes.push(result);
        }
      }
    }
  }

  return matchingNotes;
}

// Search for matching page note to current url
// If found:
// put matching page notes in search tab
// If one, then open it in page note tab and unhide the tab.

async function makePageNoteTable(page_notes, table) {
  if (displayFullTable && !encryptPageNotes) {
    table.innerHTML =
      "<tr><th>Title</th><th>Pattern</th><th>Note</th><th></th></tr>";
  } else if (encryptPageNotes) {
    table.innerHTML = "<tr><th>Title</th><th>Pattern</th><th></th></tr>";
  } else {
    table.innerHTML = "<tr><th>Title</th><th>Note</th><th></th></tr>";
  }
  page_notes.forEach((note, index) => {
    const row = table.insertRow();
    const titleCell = row.insertCell();
    const titleP = document.createElement("p");
    titleP.classList.add("truncate");

    if (encryptPageNotes || displayFullTable) {
      const urlCell = row.insertCell();
      const urlP = document.createElement("p");
      urlP.classList.add("truncate");
      urlP.textContent = note.url_pattern;
      urlCell.insertBefore(urlP, urlCell.firstChild);
    }

    if (!encryptPageNotes) {
      const noteCell = row.insertCell();
      const noteP = document.createElement("p");
      noteP.classList.add("truncate");
      noteP.textContent = truncateText(note.note, 30);
      noteCell.insertBefore(noteP, noteCell.firstChild);
    }

    const delCell = row.insertCell();

    titleP.textContent = note.title;
    delCell.textContent = "Delete";
    delCell.classList.add("onHoverChange");

    titleCell.insertBefore(titleP, titleCell.firstChild);

    titleCell.addEventListener("click", function () {
      open_page_note(note.id);
    });
    delCell.addEventListener("click", function () {
      delete_page_note(note.id);
      row.remove();
    });
  });
}

////////////////////
// NEW PAGE NOTES //
////////////////////

// When new is clicked
// Put default url pattern
// Put default title

async function get_current_url() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab.url;
}

async function newPageNote() {
  console.log("Generating new page note");
  const url = await get_current_url();
  const url_pattern = await get_default_pattern(url);
  const title = await get_default_title(url);

  const id = "mde_" + (await generateRandomAlphaNumeric(8));

  // TODO: CHECK IF TITLE IN ALREADY SAVED PAGENOTES!

  urlPatternElement.value = url_pattern;
  titleElement.value = title;
  easyMDE.value("");
  idElement.value = id;
  pageNotesTabButton.classList.remove("hidden");
  document
    .getElementById("new-page-notes-tab-button")
    .classList.remove("active");
  pageNotesTabButton.classList.add("active");
  expiringCheckbox.checked = true;
}

document
  .getElementById("new-page-notes-tab-button")
  .addEventListener("click", newPageNote);

/////////////////////////
// Additional Features //
/////////////////////////

async function downloadPageNote() {
  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }
  var textToWrite = easyMDE.value();

  // preserving line breaks
  var textToWrite = textToWrite.replace(/\n/g, "\r\n");
  var textFileAsBlob = new Blob([textToWrite], { type: "text/plain" });

  // filename to save as
  var fileNameToSaveAs =
    "pn_" + titleElement.value.replace(/[\\/:*?"<>|]/g, "") + ".txt";

  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;

  // hidden link title name
  downloadLink.innerHTML = "Download";

  window.URL = window.URL || window.webkitURL;

  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);

  downloadLink.onclick = destroyClickedElement;
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

function addCodeCopyButtons() {
  setTimeout(function () {
    var code_blocks = document.querySelectorAll("code:not(.copy_btn_added)");
    code_blocks.forEach(function (code_block) {
      code_block.classList.add("copy_btn_added");
      var copyBtn = document.createElement("button");

      copyBtn.innerHTML =
        '<img style="height: 5px;" src="images/copy.svg" alt="Icon"></img>';
      copyBtn.style =
        "float: right; margin-left: 10px; font-size: 8px; padding: 1px; vertical-align: top;";
      code_block.parentNode.insertBefore(copyBtn, code_block.nextSibling); // Insert the button after the code block

      copyBtn.addEventListener("click", function () {
        var content = code_block.innerText;
        navigator.clipboard
          .writeText(content)
          .then(() => console.log("Content copied!"))
          .catch((err) => console.error("Failed to copy content: ", err));
      });
    });
    addCodeCopyButtons();
  }, 2000);
}

addCodeCopyButtons();

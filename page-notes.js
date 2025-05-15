// Houses common functions for both sidepanel.js and options.js

function insertTextAtCursor(text) {
  const pos = easyMDE.codemirror.getCursor();
  easyMDE.codemirror.setSelection(pos, pos);
  easyMDE.codemirror.replaceSelection(text);
  // Move the cursor to the end of the inserted text
  easyMDE.codemirror.setCursor({ line: pos.line, ch: pos.ch + text.length });
}

function insertTextAtStartOfLine(text) {
  const pos = easyMDE.codemirror.getCursor();
  const startPos = { line: pos.line, ch: 0 }; // Set ch to 0 to move to the start of the line
  easyMDE.codemirror.setSelection(startPos, startPos);
  easyMDE.codemirror.replaceSelection(text);
  // Optionally, move the cursor to the end of the inserted text
  easyMDE.codemirror.setCursor({ line: pos.line, ch: text.length });
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

function replaceAndSelect(newText) {
  easyMDE.codemirror.replaceSelection(newText); // Replace the selected text with the new text
  var cursor = easyMDE.codemirror.getCursor(); // Get the current cursor position
  easyMDE.codemirror.setSelection(cursor, {
    line: cursor.line,
    ch: cursor.ch - newText.length,
  }); // Select the newly inserted text
}

/////////////
// Easymde //
/////////////

// https://github.com/Ionaru/easy-markdown-editor?tab=readme-ov-file#install-easymde

let thisIsOptionsView = false;
const viewPortWidth = window.innerWidth;
let easyMDE;
let pageNoteConfigOverwrite;
let openInPreview; //= pageNoteConfigOverwrite.openInPreview;
let openInFullScreen; // = pageNoteConfigOverwrite.openInFullScreen;
let expiringCheckbox;
let savedAtIndicator;

async function getEasyMDE() {
  let customPageNoteJson = {};

  get("page-note-json").then((value) => {
    if (value != "" && value != null && value != 0 && value != undefined) {
      customPageNoteJson = value;
    }

    function customMarkdownParser(plainText) {
      plainText = plainText.replace(
        /\{\{ TABLE_OF_CONTENTS \}\}/g,
        '<div class="page-note-table-of-contents"></div>'
      );
      // plainText = plainText.replace(/\[\]/g, '');
      return plainText;
    }

    pageNoteConfigOverwrite = {
      ...defaultPageNoteConfig, // start with the default in case custom deletes some
      ...customPageNoteJson, // Make any custom edits
      ...{
        element: document.getElementById("page-notes-textarea"), // Overwrite what needs to be there
        //previewRender: (plainText) => customMarkdownParser(plainText),
        renderingConfig: {
          sanitizerFunction: (renderedHTML) => {
            // Using DOMPurify and only allowing <b> tags
            return customMarkdownParser(renderedHTML);
          },
          taskLists: true, // Enable task lists
        },
      },
    };

    pageNoteConfigOverwrite["status"].unshift({
      className: "expiring",
    });
    pageNoteConfigOverwrite["status"].push("autosave");
    pageNoteConfigOverwrite["status"].push({
      className: "Characters",
      defaultValue: (el) => {
        el.setAttribute("data-characters", 0);
      },
      onUpdate: (el) => {
        const characters = easyMDE.value().length;
        if (characters > 7500) {
          el.classList.add("red-text");
        } else {
          el.classList.remove("red-text");
        }
        el.innerHTML = `${characters}/7500`;
      },
    });

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
        {
          name: "task-list",
          action: (editor) => {
            insertTextAtStartOfLine("- [ ] ");
          },
          className: '<i class="fa-regular fa-window-maximize"></i>',
          text: "[]",
          title: "Task List",
          attributes: {
            // for custom attributes
            id: "task-list",
            // "data-value": "custom value" // HTML5 data-* attributes need to be enclosed in quotation marks ("") because of the dash (-) in its name.
          },
        },
        {
          name: "TOC",
          action: (editor) => {
            insertTextAtCursor("{{ TABLE_OF_CONTENTS }}");
          },
          className: '<i class="fa-regular fa-window-maximize"></i>',
          text: "TOC",
          title: "Table of Contents",
          attributes: {
            // for custom attributes
            id: "table-of-contents",
            // "data-value": "custom value" // HTML5 data-* attributes need to be enclosed in quotation marks ("") because of the dash (-) in its name.
          },
        },
      ];
    } else {
      pageNoteConfigOverwrite["toolbar"].unshift({
        name: "OpenInTab",
        action: (editor) => {
          const pageNoteId = idElement.value;
          const url =
            chrome.runtime.getURL("options.html") + "?pageNote=" + pageNoteId;
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

    pageNoteConfigOverwrite["toolbar"].unshift({
      name: "ESC",
      action: (editor) => {
        // Get current selection
        const selectedText = easyMDE.codemirror.getSelection();
        // Escape markdown syntax like * and starting #
        const escapedText = selectedText.replace(/([*_#\-\[\]])/g, "\\$1");
        // Replace that selection
        easyMDE.codemirror.replaceSelection(escapedText);
      },
      className: '<i class="fa-regular fa-window-maximize"></i>',
      text: "ESC",
      title: "Escape Markdown Syntax",
      attributes: {
        // for custom attributes
        id: "escape-markdown",
        // "data-value": "custom value" // HTML5 data-* attributes need to be enclosed in quotation marks ("") because of the dash (-) in its name.
      },
    });

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
    expiringCheckbox = document.getElementById("page-notes-expiring-checkbox");
    savedAtIndicator = document.querySelector(".autosave");

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
        } else if (event.shiftKey && event.key === "F3") {
          event.preventDefault();
          const selection = easyMDE.codemirror.getSelection();
          // Cycle through capital
          const currentCase = determineCase(selection);

          let newCaseText;
          switch (currentCase) {
            case "lower":
              newCaseText = selection.toUpperCase();
              break;
            case "upper":
              newCaseText = toTitleCase(selection);
              break;
            case "title":
              newCaseText = selection.toLowerCase();
              break;
            default:
              newCaseText = selection.toUpperCase(); // Default to uppercase if undetermined
          }

          replaceAndSelect(newCaseText);
          //easyMDE.codemirror.replaceSelection(newCaseText);
        }
      });

    // END of easyMDE def.
  });
}

getEasyMDE();

///////////////
// VARIABLES //
///////////////
var urlPatternElement;
var titleElement;
var idElement;
var pageNotesTabButton;
var newPageNotesTabButton;
var openPageNoteButton;
var pageNotesSearchInput;
var recentPageNotesTable;
var recentPageNotesNoneFound;

let currentReferencePageNoteName;

let maxPageNotesTitleChar;
getSetting("max-title-char-page-notes").then(
  (value) => (maxPageNotesTitleChar = value)
);
let maxPageNotesURLChar;
getSetting("max-key-char-page-notes").then(
  (value) => (maxPageNotesURLChar = value)
);
let maxPageNotesNoteChar;
getSetting("max-value-char-page-notes").then(
  (value) => (maxPageNotesNoteChar = value)
);

let encryptPageNotes = false;
getSetting("encrypt-page-notes").then((value) => {
  encryptPageNotes = value;

  // Adjust max size if encryption is applied.
  if (value) {
    setTimeout(function () {
      maxPageNotesNoteChar = maxPageNotesNoteChar / 3;
      maxPageNotesTitleChar = maxPageNotesTitleChar / 3;
      maxPageNotesURLChar = maxPageNotesURLChar / 3;
    }, 500);
  }
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

  // if (defaultPageNoteIds.includes(id)) {
  //   note = currentReferencePageNoteName
  // }

  if (note.length > maxPageNotesNoteChar) {
    showNotification(
      `Error: Note is too long. ${note.length} is larger than max setting: ${maxPageNotesNoteChar}`,
      3
    );
    return;
  }
  if (title.length > maxPageNotesTitleChar) {
    showNotification(
      `Error: Title is too long. ${title.length} is larger than max setting: ${maxPageNotesTitleChar}`,
      3
    );
    return;
  }
  if (url_pattern.length > maxPageNotesURLChar) {
    showNotification(
      `Error: URL pattern is too long. ${url_pattern.length} is larger than max setting: ${maxPageNotesURLChar}`,
      3
    );
    return;
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

function addPageNoteIdToUrl(pageNoteId) {
  if (thisIsOptionsView) {
    const url = new URL(window.location.href);
    url.searchParams.set("pageNote", pageNoteId);
    window.history.pushState({}, "", url);
  }
}

async function updateRecentPageNotes(currentNoteId) {
  let recentPageNotes = (await get("recent_page_notes")) || [];

  // Check if the current note is already in the recent list
  const noteIndex = recentPageNotes.indexOf(currentNoteId);

  if (noteIndex !== -1) {
    return;
  }

  // Add the current note to the beginning of the list
  recentPageNotes.unshift(currentNoteId);

  // Keep only the last 5 notes
  if (recentPageNotes.length > 5) {
    recentPageNotes.pop();
  }

  // Save the updated list back to storage
  await store("recent_page_notes", recentPageNotes);
}

async function open_page_note(id, inPreview = false) {
  console.log(`Opening page note ${id}`);

  const page_note = await get_page_note(id);

  console.log(page_note);

  // Set Values
  if (defaultPageNoteIds.includes(page_note.id) && page_note.note.startsWith("http")) {
    console.log("Page not is a reference note")
    // Add Try/Except
    try {
      response = await fetch(page_note.note)
      data = await response.text()
      easyMDE.value(data);
      console.log(data)
    } catch (e) {
      console.log(e)
      easyMDE.value(page_note.note);
    }
  } else {
    console.log("Page not is not a reference note")
    easyMDE.value(page_note.note);
  }
  
  urlPatternElement.value = page_note.url_pattern;
  titleElement.value = page_note.title;
  idElement.value = id;
  // Add the page_note_id to the url as paramter pageNote=
  addPageNoteIdToUrl(id);

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

  if (!inPreview & easyMDE.isPreviewActive()) {
    easyMDE.togglePreview();
  }

  // Set options
  if (inPreview) {
    if (openInFullScreen) {
      easyMDE.toggleFullScreen();
    }
    if (openInPreview) {
      easyMDE.togglePreview();
    }
  }

  // Set Focus
  easyMDE.codemirror.focus();

  // Refresh CodeMirror
  easyMDE.codemirror.refresh();

  updateRecentPageNotes(id);
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
    try {
      note.title;
    } catch {
      return;
    }

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
      try {
        noteP.textContent = truncateText(note.note, 30);
      } catch {
        // Note was not saved
      }
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
      showNotification("Deleted note");
    });
  });
}

////////////////////
// NEW PAGE NOTES //
////////////////////

// When new is clicked
// Put default url pattern
// Put default title

async function getCurrentURL() {
  try {
    // Query the active tab in the last focused window
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    // Check if the tab exists and has a valid URL
    if (!tab || !tab.url) {
      console.log("No active tab or tab URL found");
      return "undefined";
    }

    let url = tab.url;

    // Check for special or invalid URLs
    const invalidUrls = ["about:blank", "chrome://newtab/"];
    if (invalidUrls.includes(url)) {
      console.log("Invalid or non-standard tab URL found");
      return "undefined";
    }

    // Strip trailing slash if it exists
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    return url;
  } catch (error) {
    // Log any unexpected errors
    console.error("Error retrieving current URL:", error);
    return "undefined";
  }
}

async function newPageNote() {
  console.log("Generating new page note");
  const url = await getCurrentURL();
  const url_pattern = await get_default_pattern(url);
  const title = await get_default_title(url);

  const id = "mde_" + (await generateRandomAlphaNumeric(8));

  // TODO: CHECK IF TITLE IN ALREADY SAVED PAGENOTES!

  urlPatternElement.value = url_pattern;
  titleElement.value = title;
  easyMDE.value("");
  idElement.value = id;
  pageNotesTabButton.classList.remove("hidden");
  pageNotesTabButton.click();
  expiringCheckbox.checked = true;
}
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
        '<img style="height: 5px;" src="images/copy-icon.svg" alt="Icon"></img>';
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
function enableCheckboxes() {
  const checkboxes = document.querySelectorAll(
    '.editor-preview input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.disabled = false;
  });
}

function addTOC() {
  setTimeout(function () {
    // Enable checkboxes
    enableCheckboxes();

    // TOC
    var TOC = document.querySelector(
      ".page-note-table-of-contents:not(.done-already)"
    );
    if (TOC) {
      TOC.classList.add("done-already");
      var headers = document.querySelectorAll(
        ".CodeMirror h1, .CodeMirror h2, .CodeMirror h3"
      );
      var tocHTML = "<ul>";
      headers.forEach(function (header) {
        var tag = header.tagName.toLowerCase();
        var spacing =
          tag === "h2"
            ? "&nbsp;&nbsp;"
            : tag === "h3"
            ? "&nbsp;&nbsp;&nbsp;&nbsp;"
            : "";
        tocHTML += `<li class="${tag}">${spacing}<a href="#${header.id}">${header.textContent}</a></li>`;
      });
      tocHTML += "</ul>";
      TOC.innerHTML = tocHTML;
    }
    addTOC();
  }, 2000);
}
addTOC();

async function getRecentPageNotes() {
  const recentPageNotes = await get("recent_page_notes", []);
  if (recentPageNotes.length > 0) {
    recentPageNotesNoneFound.classList.add("hidden");
    const notesDetails = [];
    for (const pn of recentPageNotes) {
      try {
        const pageNote = await get_page_note(pn);
        notesDetails.push(pageNote);
      } catch (error) {
        console.error("Failed to get page note:", error);
      }
    }
    makePageNoteTable(notesDetails, recentPageNotesTable);
  }
}

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function () {
  urlPatternElement = document.getElementById("url-pattern");
  titleElement = document.getElementById("page-notes-title");
  idElement = document.getElementById("page-note-id");
  pageNotesTabButton = document.getElementById("page-notes-tab-button");
  newPageNotesTabButton = document.getElementById("new-page-notes-tab-button");
  openPageNoteButton = document.getElementById("open-page-notes-tab-button");
  pageNotesSearchInput = document.getElementById("page-notes-search");
  recentPageNotesTable = document.getElementById("recent-page-notes-table");
  recentPageNotesNoneFound = document.getElementById("recent-page-notes");
  pnHelpButton = document.getElementById("page-notes-help-tab-button");

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
  openPageNoteButton.addEventListener("click", function () {
    setTimeout(function () {
      pageNotesSearchInput.focus();
    }, 50);
  });

  // Focus on page note when clicking "page note"
  pageNotesTabButton.addEventListener("click", function () {
    setTimeout(function () {
      easyMDE.codemirror.focus();
    }, 50);
  });
});

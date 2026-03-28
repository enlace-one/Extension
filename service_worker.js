console.log("service_worker.js")
importScripts('/third_party/crypto-js.min.js');
importScripts('util.js');

let encryptPageNotes = false
getSetting("encrypt-page-notes").then((value)=> {
  encryptPageNotes = value
});

async function _save_page_note(id, note, title, url_pattern) {
  if (encryptPageNotes) {
      note = await encrypt(note)
  } 
  const noteData = {
      note: note,
      title: title,
      url_pattern: url_pattern,
      id: id
  };
  store(id, noteData)
  console.log(`Note saved with ID: ${id}`);
}


 async function _storeDefaultPageNotes() {
  console.log("Storing default page notes")

  const results = await chrome.storage.sync.get();
  for (let item of defaultPageNotes) {
    // Reference does not exist
    if (!(item.id in results)) {
      console.log(`Saving ${item.id} as it's not existant`)
        _save_page_note(item.id, item.text, item.title, item.url_pattern)
    } else {
      // Reference has not been edited
      if (results[item.id] == item.text) {
        console.log(`Saving ${item.id} as it's not edited`)
        _save_page_note(item.id, item.text, item.title, item.url_pattern)
      } else {
        console.log(`Ignoring ${item.id} as it's edited`)
      }
    }
  }
}

let hasRun = false;
async function storeDefaultPageNotes() {
  self.addEventListener('message', async (event) => {
    if (event.data.action === 'appStateChanged' && event.data.isUnlocked && !hasRun) {
      if (!await isLocked()) {
        setTimeout(_storeDefaultPageNotes, 3000);
        hasRun = true; // Set the flag to true after running
      }
    }
  });
}

// Open options page on install or update and add page notes
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install' || details.reason === 'update') {
      chrome.tabs.create({ url: 'options.html' });
    }
    storeDefaultPageNotes()
});

async function get_clipboard_command_value(command) {
  
  if (await getSetting("encrypt-clipboard") === true) {
    if (!await isLocked()) {
      return await convertSmartValues(await eGet(command))
    } else {
      // service_worker.js (or .ts)
      chrome.notifications.create({
        type: "basic",
        iconUrl: "ea_128.png", // must be in extension's manifest
        title: "Copy Error",
        message: "You can't use the copy shortcuts while the Page Notes is locked",
      });
      

    }
  } else {
    return await convertSmartValues(await get(command))
  }
}



// Handle Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    console.log(`Command: ${command}`);

    if (command.startsWith("open-side-panel")) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            // // Check if the side panel is open and close if so
            // // Didn't work because you have about .1 seconds to
            // // open the side panel on user input

            chrome.sidePanel.getOptions({ tabId: tab.id }, (options) => {
                if (options.enabled) {                    
                    console.log("Sidepanel already open")
                } 
            });

            // When the sidepanel is open, this is used to bring 
            // it into focus and turn off preview
            try {
              chrome.tabs.sendMessage({
                type: 'open-side-panel',
                target: 'sidepanel',
                data: true
              });
            } catch {
              // No action needed, listener not set up yet.
            }

            try {
              chrome.sidePanel.open({ tabId: tab.id });
            } catch {
              console.log("Failed to open the side panel.")
            }
          });
    } else if (command.startsWith("copy-value")) {
        await addToClipboard(await get_clipboard_command_value(command))

    } else if (command.startsWith("start-stop-clip-combiner")) {

    } else if (command === "open-extension-tab") {
        chrome.runtime.openOptionsPage();
    }
  });
  
  // Solution 1 - As of Jan 2023, service workers cannot directly interact with
  // the system clipboard using either `navigator.clipboard` or
  // `document.execCommand()`. To work around this, we'll create an offscreen
  // document and pass it the data we want to write to the clipboard.
  async function addToClipboard(value) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'Write text to the clipboard.'
    });
  
    // Now that we have an offscreen document, we can dispatch the
    // message.
    try {
        chrome.runtime.sendMessage({
        type: 'copy-data-to-clipboard',
        target: 'offscreen-doc',
        data: value
      });
    } catch {
      console.log("Recieving end is not established yet")
    }
  }
  
  // Solution 2 – Once extension service workers can use the Clipboard API,
  // replace the offscreen document based implementation with something like this.
  async function addToClipboardV2(value) {
    navigator.clipboard.writeText(value);
  } 


// Handle SmartValues like {{ month }}, {{ day }}, {{ date }}, {{ time }}, {{ year }}, {{ yy }}, {{ yyyy }}, {{ MM }}, {{ dd }}, {{ hh }}, {{ mm }}, {{ ss }}, {{ weekday }}
// Does not matter if there is a space or not. Ex: {{month}} or {{ month }}
async function convertSmartValues(string) {

    // Possible fix to edge error 7/4/2024
    if (typeof string !== 'string' && string !== undefined) {
      string = string.toString();
    } else if (string == undefined) {
      console.log("Input is not defined")
      1/0
    }

    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    var yy = year.toString().slice(2)
    var MM = month.toString().padStart(2, '0')
    var dd = day.toString().padStart(2, '0')
    var hh = hour.toString().padStart(2, '0')
    var mm = minute.toString().padStart(2, '0')
    var ss = second.toString().padStart(2, '0')

    string = string.replace(/{{\s*year\s*}}/g, year)
    string = string.replace(/{{\s*day\s*}}/g, day)
    string = string.replace(/{{\s*hour\s*}}/g, hour)
    string = string.replace(/{{\s*minute\s*}}/g, minute)
    string = string.replace(/{{\s*second\s*}}/g, second)
    string = string.replace(/{{\s*yy\s*}}/g, yy)
    string = string.replace(/{{\s*yyyy\s*}}/g, year)
    string = string.replace(/{{\s*MM\s*}}/g, MM)
    string = string.replace(/{{\s*dd\s*}}/g, dd)
    string = string.replace(/{{\s*hh\s*}}/g, hh)
    string = string.replace(/{{\s*mm\s*}}/g, mm)
    string = string.replace(/{{\s*ss\s*}}/g, ss)

    string = string.replace(/{{\s*date\s*}}/g, `${year}-${MM}-${dd}`)
    string = string.replace(/{{\s*time\s*}}/g, `${hh}:${mm}:${ss}`)

    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = days[date.getDay()];

    string = string.replace(/{{\s*weekday\s*}}/g, dayName);

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let monthName = months[date.getMonth()];

    string = string.replace(/{{\s*month\s*}}/g, monthName);

    return string

}

/////////////////
// TAB MANAGER //
/////////////////

const TAB_MANAGER_SCRIPT_ID = "tab-manager-script";

async function runTabManager() {
  const [
    revolverOn,
    refresherOn,
    closerOn,
    secondsToWait,
    revolverMode,
    revolverExclusionList,
    revolverInclusionList,
    refresherMode,
    refresherExclusionList,
    refresherInclusionList,
    closerMode,
    closerExclusionList,
    closerInclusionList,
    revolverPause,
    refresherPause,
    closerPause,
  ] = await Promise.all([
    get("revolver-power", "off"),
    get("refresher-power", "off"),
    get("closer-power", "off"),
    getSetting("tab-manager-seconds-to-wait"),
    getSetting("revolver-mode"),
    getSetting("revolver-exclusion-list"),
    getSetting("revolver-inclusion-list"),
    getSetting("refresher-mode"),
    getSetting("refresher-exclusion-list"),
    getSetting("refresher-inclusion-list"),
    getSetting("closer-mode"),
    getSetting("closer-exclusion-list"),
    getSetting("closer-inclusion-list"),
    getSetting("revolver-pause-after-activity"),
    getSetting("refresher-pause-after-activity"),
    getSetting("closer-pause-after-activity"),
  ]);

  const isRevolverOn = revolverOn === "on";
  const isRefresherOn = refresherOn === "on";
  const isCloserOn = closerOn === "on";
  const waitMs = (parseInt(secondsToWait) || 30) * 1000;

  const timeSinceActivity = Date.now() - lastActivityTimestamp;
  const activityRecent = timeSinceActivity < waitMs;

  const parseList = (raw) =>
    (raw || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  function matchesPattern(url, pattern) {
    if (pattern.startsWith("/") && pattern.endsWith("/")) {
      const regex = new RegExp(pattern.slice(1, -1));
      return regex.test(url);
    }
    return url.startsWith(pattern);
  }

  function isUrlAllowed(url, mode, exclusionList, inclusionList) {
    if (mode === "inclusion") {
      return inclusionList.some((p) => matchesPattern(url, p));
    } else {
      return !exclusionList.some((p) => matchesPattern(url, p));
    }
  }

  const extensionUrl = chrome.runtime.getURL("");

  // Try active tab in current window first
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // If active tab is the extension popup, find the active tab in another window
  if (!tab || tab.url.startsWith(extensionUrl)) {
    const allWindows = await chrome.windows.getAll({ populate: true });
    for (const window of allWindows) {
      const activeTab = window.tabs.find(t => t.active && !t.url.startsWith(extensionUrl));
      if (activeTab) {
        tab = activeTab;
        break;
      }
    }
  }

  if (!tab) return;

  const url = tab.url;

  // Revolver
  if (
    isRevolverOn &&
    isUrlAllowed(url, revolverMode, parseList(revolverExclusionList), parseList(revolverInclusionList))
  ) {
    if (revolverPause === "pause" && activityRecent) {
      console.log("Revolver paused due to activity");
    } else {
      const tabs = await chrome.tabs.query({ windowId: tab.windowId });
      const currentIndex = tabs.findIndex((t) => t.id === tab.id);
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      await chrome.tabs.update(nextTab.id, { active: true });
    }
  }

  // Refresher
  if (
    isRefresherOn &&
    isUrlAllowed(url, refresherMode, parseList(refresherExclusionList), parseList(refresherInclusionList))
  ) {
    if (refresherPause === "pause" && activityRecent) {
      console.log("Refresher paused due to activity");
    } else {
      await chrome.tabs.reload(tab.id);
    }
  }

  // Closer
  if (
    isCloserOn &&
    isUrlAllowed(url, closerMode, parseList(closerExclusionList), parseList(closerInclusionList))
  ) {
    if (closerPause === "pause" && activityRecent) {
      console.log("Closer paused due to activity");
    } else {
      await chrome.tabs.remove(tab.id);
    }
  }
}

let lastActivityTimestamp = Date.now();
let tabManagerTimeoutStarted = null;
let tabManagerTimeout = null;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "activityDetected") {
    lastActivityTimestamp = message.timestamp;
  }

  if (message.action === "appStateChanged" && message.hasChanged) {
    (async () => {
      await runTabManager();
      await scheduleTabManager();
      await updateBadge();
    })();
  }

  if (message.action === "getCountdownState") {
    (async () => {
      const secondsToWait = await getSetting("tab-manager-seconds-to-wait");
      const waitMs = (parseInt(secondsToWait) || 30) * 1000;
      const elapsed = tabManagerTimeoutStarted ? Date.now() - tabManagerTimeoutStarted : 0;
      const remaining = Math.max(0, waitMs - elapsed);
      const timeSinceActivity = Date.now() - lastActivityTimestamp;
      const paused = timeSinceActivity < waitMs;

      sendResponse({ remaining, paused, waitMs });
    })();
    return true;
  }
});

async function scheduleTabManager() {
  if (tabManagerTimeout) clearTimeout(tabManagerTimeout);

  const secondsToWait = await getSetting("tab-manager-seconds-to-wait");
  const waitMs = (parseInt(secondsToWait) || 30) * 1000;

  tabManagerTimeoutStarted = Date.now();

  tabManagerTimeout = setTimeout(async function () {
    await runTabManager();
    scheduleTabManager();
  }, waitMs);
}

scheduleTabManager();
updateBadge();

////////////////
// Badge Icon //
////////////////
async function updateIcon(isRefresherActive, isRefresherPaused, hasMatchingNote) {
  const canvas = new OffscreenCanvas(128, 128);
  const ctx = canvas.getContext("2d");

  // Draw base icon
  const response = await fetch(chrome.runtime.getURL("ea_128.png"));
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);
  ctx.drawImage(imageBitmap, 0, 0, 128, 128);

  // Bottom right — refresh indicator
  if (isRefresherActive || isRefresherPaused) {
    ctx.font = "bold 70px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = isRefresherActive ? "#4CAF50" : "#FF9800";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText("↻", 128, 128);
    ctx.shadowBlur = 0;
  }

  // Bottom left — page note indicator
  if (hasMatchingNote) {
    ctx.font = "bold 70px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText("✎", 0, 128);
    ctx.shadowBlur = 0;
  }

  const imageData = ctx.getImageData(0, 0, 128, 128);
  chrome.action.setIcon({ imageData });
}

async function updateBadge() {
  const [revolverOn, refresherOn, closerOn] = await Promise.all([
    get("revolver-power", "off"),
    get("refresher-power", "off"),
    get("closer-power", "off"),
  ]);

  const isRevolverOn = revolverOn === "on";
  const isRefresherOn = refresherOn === "on";
  const isCloserOn = closerOn === "on";

  // Check for matching page note on current tab
  const extensionUrl = chrome.runtime.getURL("");
  let hasMatchingNote = false;

  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && !tab.url.startsWith(extensionUrl)) {
      const matches = await get_matching_page_notes(tab.url);
      hasMatchingNote = matches.length > 0;
    } else {
      const allWindows = await chrome.windows.getAll({ populate: true });
      for (const window of allWindows) {
        const activeTab = window.tabs.find(t => t.active && !t.url.startsWith(extensionUrl));
        if (activeTab) {
          const matches = await get_matching_page_notes(activeTab.url);
          hasMatchingNote = matches.length > 0;
          break;
        }
      }
    }
  } catch (e) {
    console.log("Error checking page notes:", e);
  }

  // Update hover title
  const parts = [];
  if (isRevolverOn) parts.push("Revolver");
  if (isRefresherOn) parts.push("Refresher");
  if (isCloserOn) parts.push("Auto-Closer");
  if (hasMatchingNote) parts.push("Matching Note");
  chrome.action.setTitle({
    title: parts.length ? `Page Notes — ${parts.join(", ")}` : "Page Notes"
  });

  // Check pause state
  const secondsToWait = await getSetting("tab-manager-seconds-to-wait");
  const waitMs = (parseInt(secondsToWait) || 30) * 1000;
  const timeSinceActivity = Date.now() - lastActivityTimestamp;
  const activityRecent = timeSinceActivity < waitMs;
  const isRefresherPaused = isRefresherOn && activityRecent;
  const isRefresherActiveUnpaused = isRefresherOn && !activityRecent;

  await updateIcon(isRefresherActiveUnpaused, isRefresherPaused, hasMatchingNote);
}

chrome.tabs.onActivated.addListener(function () {
  updateBadge();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === "complete") {
    updateBadge();
  }
});
console.log("util.js");

default_settings = {
};

/**
 * Retrieves a value from Chrome's synchronized storage using the specified key.
 * If the key is not found, the function returns the provided default value.
 *
 * @param {string} key - The key to retrieve the value from storage.
 * @param {*} [defaultValue=null] - The default value to return if the key is not found in storage.
 * @returns {Promise<*>} - A promise that resolves to the value from storage, or the default value if the key is not found.
 */
async function getFromLocalStorage(key, defaultValue = null) {
  return chrome.storage.sync.get([key]).then((result) => {
    return result[key] !== undefined ? result[key] : defaultValue;
  });
}

/**
 * Stores a value in Chrome's synchronized storage with the specified key.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {*} value - The value to store.
 * @returns {Promise<void>} - A promise that resolves when the value has been stored.
 */
async function setInLocalStorage(key, value) {
  const data = {};
  data[key] = value;

  return chrome.storage.sync.set(data).then(() => {
    console.log(`Value is set for ${key}`);
  });
}



// async function store(key, value) {
//   console.log(key, value);
//   const data = {};
//   data[key] = value;
//   chrome.storage.sync.set(data).then(() => {
//     console.log("Value is set for " + key);
//   });
// }
// async function get(key, defaultValue = null) {
//   return chrome.storage.sync.get([key]).then((result) => {
//     return result[key] !== undefined ? result[key] : defaultValue;
//   });
// }




async function getSetting(setting_name) {
  settings = await get("enlace-settings");
  if (settings) {
    if (setting_name in settings) {
      return settings[setting_name];
    } else if (setting_name in default_settings) {
      return default_settings[setting_name];
    } else {
      console.log("missing setting" + setting_name);
    }
  } else {
    if (setting_name in default_settings) {
      return default_settings[setting_name];
    } else {
      console.log("missing setting" + setting_name);
    }
  }
}

/**
 * Retrieves all custom settings plus the default settings.
 * @returns {Promise<Object>} A promise that resolves with an object containing all settings.
 */
async function getAllSettings() {
  const settings = await get("enlace-settings"); // Fetch stored settings
  const return_settings = {}; // Initialize an empty object to store final settings

  // Iterate over each key in default_settings
  for (const key in default_settings) {
    if (settings && settings.hasOwnProperty(key)) {
      // If the key exists in settings, use that value
      return_settings[key] = settings[key];
    } else {
      // Otherwise, use the default setting
      return_settings[key] = default_settings[key];
    }
  }

  return return_settings; // Return the constructed settings object
}


async function setSetting(setting_name, value) {
  console.log(`Setting ${setting_name} as ${value}`);
  settings = await get("enlace-settings");
  if (settings) {
    if (setting_name in settings) {
      if (settings[setting_name] != value) {
        settings[setting_name] = value;
      }
    } else if (setting_name in default_settings) {
      if (default_settings[setting_name] != value) {
        settings[setting_name] = value;
      }
    } else {
      console.log("Error setting" + setting_name);
    }
  } else {
    settings = {};
    if (setting_name in default_settings) {
      if (default_settings[setting_name] != value) {
        settings[setting_name] = value;
      }
    } else {
      console.log("missing setting" + setting_name);
    }
  }
  await store("enlace-settings", settings);
}

async function generateRandomAlphaNumeric(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  return result;
}

function showNotification(message, seconds = 1) {
  const notification = document.createElement("div");
  notification.classList.add("tooltiptext");
  notification.style = "visibility: visible; opacity: 1; display: block;";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(function () {
    document.body.removeChild(notification);
  }, seconds * 1000);
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function determineCase(text) {
  if (text === text.toLowerCase()) return 'lower';
  if (text === text.toUpperCase()) return 'upper';
  if (text === toTitleCase(text)) return 'title';
  return 'mixed';
}

function toTitleCase(text) {
  return text.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Function to execute code in the context of the current page's tab
async function runFunctionOnPage(func, args = []) {
  let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
  });

  return new Promise((resolve, reject) => {
      chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: func,
          args: args
      }, (results) => {
          if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
          } else {
              resolve(results[0].result);
          }
      });
  });
}
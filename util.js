console.log("util.js");

function isUserScriptsAvailable() {
  try {
    // Property access which throws if developer mode is not enabled.
    chrome.userScripts;
    return true;
  } catch {
    // Not available, so hide UI and show error.
    document.getElementById("warning").style.display = "block";
    FORM.style.display = "none";
    return false;
  }
}

async function isLocked() {
  return await chrome.storage.session
    .get(["en_locked"])
    .then(async (result) => {
      if ("en_locked" in result) {
        const lockedValue = await result.en_locked;
        const isString = typeof lockedValue === "string"; // Check if lockedValue is a string
        return !isString;
      } else {
        console.log("en_locked not in result " + result);
        return true;
      }
    })
    .catch((error) => {
      console.log(error);
      return true;
    });
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function store(key, value) {
  console.log(key, value);
  const data = {};
  data[key] = value;
  chrome.storage.sync.set(data).then(() => {
    console.log("Value is set for " + key);
  });
}
async function get(key) {
  return chrome.storage.sync.get([key]).then((result) => {
    return result[key];
  });
}

var crypt = {
  // (A1) THE SECRET KEY
  secret: "Default",

  // (A2) ENCRYPT USING AES
  encryptAES: (clear) => {
    var cipher = CryptoJS.AES.encrypt(clear, crypt.secret);
    return cipher.toString();
  },

  // (A3) DECRYPT USING AES
  decryptAES: (cipher) => {
    var decipher = CryptoJS.AES.decrypt(cipher, crypt.secret);
    return decipher.toString(CryptoJS.enc.Utf8);
  },

  // (B2) ENCRYPT USING DES
  encryptDES: (clear) => {
    var cipher = CryptoJS.DES.encrypt(clear, crypt.secret);
    return cipher.toString();
  },

  // (B3) DECRYPT USING DES
  decryptDES: (cipher) => {
    var decipher = CryptoJS.DES.decrypt(cipher, crypt.secret);
    return decipher.toString(CryptoJS.enc.Utf8);
  },

  // (C2) ENCRYPT USING TripleDES
  encryptTripleDES: (clear) => {
    var cipher = CryptoJS.TripleDES.encrypt(clear, crypt.secret);
    return cipher.toString();
  },

  // (C3) DECRYPT USING TripleDES
  decryptTripleDES: (cipher) => {
    var decipher = CryptoJS.TripleDES.decrypt(cipher, crypt.secret);
    return decipher.toString(CryptoJS.enc.Utf8);
  },
};

async function encrypt(value) {
  if (!(await isLocked())) {
    var secret = await chrome.storage.session
      .get(["en_locked"])
      .then((value) => value.en_locked);
    crypt.secret = secret;
    switch (await getSetting("encryption-algorithm")) {
      case "3DES":
        var cipherText = await crypt.encryptTripleDES(value);
        break;
      case "DES":
        var cipherText = await crypt.encryptDES(value);
        break;
      default:
        console.log("Default encryption used");
        var cipherText = await crypt.encryptAES(value);
        break;
    }
    return cipherText;
  } else {
    console.log("Error storing, app locked");
  }
}

async function decrypt(cipherText) {
  if (!(await isLocked())) {
    var secret = await chrome.storage.session
      .get(["en_locked"])
      .then((value) => value.en_locked);
    crypt.secret = secret;
    //var decipher = await crypt.decrypt(cipherText);
    switch (await getSetting("encryption-algorithm")) {
      case "3DES":
        var decipher = await crypt.decryptTripleDES(cipherText);
        break;
      case "DES":
        var decipher = await crypt.decryptDES(cipherText);
        break;
      default:
        var decipher = await crypt.decryptAES(cipherText);
        break;
    }
    return decipher;
  } else {
    console.log("Error getting, app locked");
  }
}

async function eStore(key, value) {
  var cipherText = await encrypt(value);
  store(key, cipherText);
  return true;
}

async function eGet(key) {
  var cipherText = await get(key);
  var decipher = await decrypt(cipherText);
  return decipher;
}

default_settings = {
  "encrypt-page-notes": false,
  "encrypt-clipboard": true,
  "encrypt-snippets": false,
  "max-char-clipboard": 1000,
  "max-key-char-snippets": 50,
  "max-value-char-snippets": 1000,
  "max-key-char-page-notes": 350,
  "max-value-char-page-notes": 7500,
  "max-title-char-page-notes": 350,
  "encryption-algorithm": "AES",
  "last-open-ref-file": "css_selectors.txt",
};

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

async function storeSetting(setting_name, value) {
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

function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("tooltiptext");
  notification.style = "visibility: visible; opacity: 1; display: block;";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(function () {
    document.body.removeChild(notification);
  }, 1000);
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

const defaultPageNoteConfig = {
  unorderedListStyle: "-",
  shortcuts: {
    togglePreview: "Alt-P",
    cleanBlock: "Cmd-E",
    drawImage: "Cmd-Alt-I",
    drawLink: "Cmd-K",
    toggleBlockquote: "Cmd-'",
    toggleBold: "Cmd-B",
    toggleCodeBlock: "Cmd-Alt-C",
    toggleFullScreen: "F11",
    toggleHeading1: "Ctrl+Alt+1",
    toggleHeading2: "Ctrl+Alt+2",
    toggleHeading3: "Ctrl+Alt+3",
    toggleHeading4: "Ctrl+Alt+4",
    toggleHeading5: "Ctrl+Alt+5",
    toggleHeading6: "Ctrl+Alt+6",
    toggleHeadingBigger: "Shift-Cmd-H",
    toggleHeadingSmaller: "Cmd-H",
    toggleItalic: "Cmd-I",
    toggleOrderedList: "Cmd-Alt-L",
    togglePreview: "Alt-P",
    toggleSideBySide: "F9",
    toggleUnorderedList: "Cmd-L",
  },
  autofocus: true,
  spellChecker: false,
  renderingConfig: {
    codeSyntaxHighlighting: true,
  },
  lineNumbers: false,
  openInPreview: true,
  openInFullScreen: true,
  // uploadImage: true,
  toolbar: [
    "code",
    "quote",
    "link",
    "image",
    "preview",
    "side-by-side",
    "fullscreen",
    "guide",
    "table",
  ],
  status: ["lines", "words"],
};

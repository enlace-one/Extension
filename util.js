console.log("util.js");


const defaultPageNotes = [
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/keyboard_chrome.md", id:"mde_keyboard_chrome.md", url_pattern:"", title:"Chrome Keyboart Shortcuts"}, 
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/keyboard_confluence.md", id:"mde_keyboard_confluence.md", url_pattern:"confluence", title:"Confluence Keyboart Shortcuts"}, 
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/keyboard_github.md", id:"mde_keyboard_github.md", url_pattern:"github", title:"Github Keyboart Shortcuts"}, 
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/keyboard_jira.md", id:"mde_keyboard_jira.md", url_pattern:"jira", title:"Jira Keyboart Shortcuts"}, 
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/keyboard_loop.md", id:"mde_keyboard_loop.md", url_pattern:"loop", title:"Loop Keyboart Shortcuts"}, 
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/code_css_selectors.md", id:"mde_code_css_selectors.md", url_pattern:"", title:"CSS Selectors"}, 
  {text:"https://raw.githubusercontent.com/enlace-one/Documentation/main/code_regex.md", id:"mde_code_regex.md", url_pattern:"", title:"Regex"},
  // {text:"css_selectors.md", id:"mde_css_selectors", url_pattern:"chrome-extension:", title:"HTML/CSS Selectors"}, 
  // {text:"bash.md", id:"mde_bash", url_pattern:"", title:"Bash"}, 
  // {text:"chrome_keyboard.md", id:"mde_chrome_keyboard", url_pattern:"", title:"Chrome Keyboard Shortcuts"}, 
  // {text:"git.md", id:"mde_git", url_pattern:"", title:"git"}, 
  // {text:"regex.md", id:"mde_regex", url_pattern:"chrome-extension:", title:"Regex"}, 
  // {text:"country_codes.md", id:"mde_country_codes", url_pattern:"", title:"Country Codes"}, 
  // {text:"linux_keyboard.md", id:"mde_linux_keyboard", url_pattern:"", title:"Linux Keyboard"}, 
  // {text:"linux_term.md", id:"mde_linux_term", url_pattern:"", title:"Linux Terminal"}, 
  
  // {text:"nmap.md", id:"mde_nmap", url_pattern:"", title:"NMAP"}, 
  // {text:"powershell.md", id:"mde_powershell", url_pattern:"", title:"Powershell"}, 
  // {text:"sql.md", id:"mde_sql", url_pattern:"", title:"SQL"}, 
  // {text:"us_states.md", id:"mde_us_states", url_pattern:"", title:"US States"}, 
  // {text:"windows_cmd.md", id:"mde_cmd", url_pattern:"", title:"Windows CMD"}, 
  // {text:"windows_keyboard.md", id:"mde_windows_keyboard", url_pattern:"", title:"Windows Keyboard Shortcuts"},
  // {text:"keyboard_nav.md", id:"mde_keyboard_nav", url_pattern:"", title:"Keyboard Navigation Basics"},
  // {text:"confluence_keyboard.md", id:"mde_confluence_keyboard", url_pattern:"confluence", title:"Confluence Keyboard Shortcuts"},
  // {text:"github_keyboard.md", id:"mde_github_keyboard", url_pattern:"github\.com", title:"GitHub Keyboard Shortcuts"},
  // {text:"loop_keyboard.md", id:"mde_loop_keyboard", url_pattern:"loop", title:"Microsoft Loop Keyboard Shortcuts"},
  // {text:"jira_keyboard.md", id:"mde_jira_keyboard", url_pattern:"jira", title:"Jira Keyboard shortcuts"},
 ]

const defaultPageNoteIds = defaultPageNotes.map((pn)=>pn.id)

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
async function get(key, defaultValue = null) {
  return chrome.storage.sync.get([key]).then((result) => {
    return result[key] !== undefined ? result[key] : defaultValue;
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
  "last-open-ref-file": "css_selectors.md",
  "zoomSetting": 1,
  "requests-excluded-content-types": ['image/', 'application/javascript', 'application/x-javascript', 'text/javascript'],
  "requests-excluded-extensions": ["woff", "png", "jpg", "jpeg", "gif", "svg", "js", "css", "ico"],
  "requests-excluded-headers": [
    'accept-encoding',
    'accept-language',
    'connection',
    'host',
    'user-agent',
    'sec-ch-ua-platform',
    'sec-ch-ua-mobile',
    'date',
    'keep-alive',
    'proxy-connection',
    'te',
    'upgrade-insecure-requests',
    'x-requested-with',
    'content-encoding',
    'content-length',
    'connection',
    'keep-alive',
    'proxy-connection',
    'set-cookie',
    'transfer-encoding',
    'vary',
    'x-powered-by',
    'x-frame-options',
    'x-xss-protection'
  ],
  "web-app-sec-common-testing-inputs": ['<input autofocus onfocus=alert(1)>',
    "{{$on.constructor('alert(2)')()}}",
    "<img src=1 oNeRrOr=alert`6`> ",
    "javascript:alert('https://javscript.runs')",
    "' Or '87' ='87",
    " Or 87=87",
    "' UNION SELECT null FROM all_tables -- ",
    "' UNION SELECT null FROM dual -- ",
    "'; UPDATE users SET password='peter' WHERE username > '1' -- ",
    "& ping -c 10 127.0.0.1 &",
    "|| whoami > /var/www/static/whoami.txt ||"
  ],
  "web-app-sec-header-modifications": {"pragma": "x-get-cache-key"}

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

const defaultExcludedContentTypes = ['image/', 'application/javascript', 'application/x-javascript', 'text/javascript'];
const defaultExcludedExtensions = /\.(png|jpg|jpeg|gif|svg|js|css)$/i;

const defaultPageNoteConfig = {
  unorderedListStyle: "-",
  shortcuts: {
    togglePreview: "Alt-P",
    cleanBlock: "Ctrl-E",
    drawImage: "Ctrl-Alt-I",
    drawLink: "Ctrl-K",
    toggleBlockquote: "Ctrl-'",
    toggleBold: "Ctrl-B",
    toggleCodeBlock: "Ctrl-Alt-C",
    toggleFullScreen: "F11",
    toggleHeading1: "Ctrl+Alt+1",
    toggleHeading2: "Ctrl+Alt+2",
    toggleHeading3: "Ctrl+Alt+3",
    toggleHeading4: "Ctrl+Alt+4",
    toggleHeading5: "Ctrl+Alt+5",
    toggleHeading6: "Ctrl+Alt+6",
    toggleHeadingBigger: "Shift-Ctrl-H",
    toggleHeadingSmaller: "Ctrl-H",
    toggleItalic: "Ctrl-I",
    toggleOrderedList: "Ctrl-/",
    togglePreview: "Alt-P",
    toggleSideBySide: "F9",
    toggleUnorderedList: "Ctrl-.",
  },
  autofocus: true,
  maxHeight: "50vh",
  spellChecker: false,
  renderingConfig: {
    codeSyntaxHighlighting: true,
  },
  lineNumbers: false,
  openInPreview: true,
  openInFullScreen: true,
  // uploadImage: true,
  toolbar: [
    "link",
    "image",
    "preview",
    "side-by-side",
    "fullscreen",
    "guide",
    "table",
  ],
  status: [], // "lines", "words"
};


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

// HTML encoding function
function htmlEncode(str) {
  var temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// HTML decoding function
function htmlDecode(str) {
  var temp = document.createElement('div');
  temp.innerHTML = str;
  return temp.textContent;
}

function decEncode(str) {
  return str.split('').map(char => `&#${char.charCodeAt(0)};`).join('');
}

// Function to decode a string from decimal entities
function decDecode(encodedStr) {
  return encodedStr.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

function hexEncode(str) {
  return str.split('').map(char => `&#x${char.charCodeAt(0).toString(16)};`).join('');
}

// Function to decode a string from hexadecimal entities
function hexDecode(encodedStr) {
  return encodedStr.replace(/&#x([\da-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function urlDecodeAll(encodedStr) {
  // Use a regular expression to match all percent-encoded characters
  return encodedStr.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function urlEncodeAll(str) {
  return str.split('')
    .map(char => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

function htmlEntityEncode(str) {
  return str.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
    return `&#${i.charCodeAt(0)};`;
  });
}

// Function to decode HTML entities back to their original form
function htmlEntityDecode(encodedStr) {
  let textarea = document.createElement('textarea');
  textarea.innerHTML = encodedStr;
  return textarea.value;
}

function b64Encode(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...utf8Bytes));
}

// Function to base64 decode a string
function b64Decode(encodedStr) {
  try {
    const binaryString = atob(encodedStr);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "Error"
  }
}



// Function to execute code in the context of the current page's tab
async function runFunctionOnPage(func, args=[]) {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id
    },
    function: func,
    args: args
  }, (results) => {
    console.log(results);
    return results
  });
}

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
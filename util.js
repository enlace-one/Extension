console.log("util.js")

// Util 
async function isLocked() {
    return await chrome.storage.session.get(["en_locked"]).then(async (result) => {
        if ("en_locked" in result) {
            const lockedValue = await result.en_locked;
            const isString = typeof lockedValue === 'string'; // Check if lockedValue is a string
            return !(isString)
        } else {
            console.log("en_locked not in result " + result)
            return true
        }
    }).catch((error) => {
        console.log(error)
        return true
    });
}


async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


async function store(key, value) {
    console.log(key, value)
    const data = {};
    data[key] = value;
    chrome.storage.sync.set(data).then(() => {
        console.log("Value is set for " + key);
    });
}
async function get(key) {
    return chrome.storage.sync.get([key]).then((result) => {
            return result[key]
    });
}

// Test
// const test_store = store("test", "123")
// get("test").then((value) => {
//     if (value == "123") {
//         console.log("Storage Test Success " + value)
//     } else {
//         console.log("Storage Test Failure " + value)
//     }
// })


var crypt = {
  // (B1) THE SECRET KEY
  secret : "Default",
 
  // (B2) ENCRYPT
  encrypt : clear => {
    var cipher = CryptoJS.AES.encrypt(clear, crypt.secret);
    return cipher.toString();
  },
 
  // (B3) DECRYPT
  decrypt : cipher => {
    var decipher = CryptoJS.AES.decrypt(cipher, crypt.secret);
    return decipher.toString(CryptoJS.enc.Utf8);
  }
};
 

async function encrypt(value) {
    if (! await isLocked()) {
        var secret = await chrome.storage.session.get(["en_locked"]).then((value) => value.en_locked)
        crypt.secret = secret
        var cipherText = await crypt.encrypt(value);
        return cipherText
    } else {
        console.log("Error storing, app locked")
    }
}

async function decrypt(cipherText) {
    if (! await isLocked()) {
        var secret = await chrome.storage.session.get(["en_locked"]).then((value) => value.en_locked)
        crypt.secret = secret
        var decipher = await crypt.decrypt(cipherText);
        return decipher
    } else {
        console.log("Error getting, app locked")
    }
}

async function eStore(key, value) {
    var cipherText = await encrypt(value);
    store(key, cipherText)
    return true
}


async function eGet(key) {
    var cipherText = await get(key)
    var decipher = await decrypt(cipherText);
    return decipher
}


async function getSetting(setting_name) {
    defaults = {"encrypt-page-notes": false}
    settings = await get("enlace-settings")
    if (settings) {
        if (setting_name in settings) {
            return settings[setting_name]
        } else if (setting_name in defaults) {
            return defaults[setting_name]
        } else {
            console.log("missing setting" + setting_name)
        }
    } else {
        if (setting_name in defaults) {
            return defaults[setting_name]
        } else {
            console.log("missing setting" + setting_name)
        }
    }
}


function generateRandomAlphaNumeric(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }
    return result;
}


function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('tooltiptext');
    notification.style = "visibility: visible; opacity: 1; display: block;";
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
      document.body.removeChild(notification);
    }, 1000);
  }


  function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }


  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
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
    chrome.storage.local.set(data).then(() => {
        console.log("Value is set for " + key);
    });
}
async function get(key) {
    return chrome.storage.local.get([key]).then((result) => {
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
 

async function eStore(key, value) {
    if (isLocked()) {
        var secret = await chrome.storage.session.get(["en_locked"]).then((value) => value.en_locked)
        crypt.secret = secret
        var cipherText = await crypt.encrypt(value);
        store(key, cipherText)
        return true
    } else {
        console.log("Error storing, app locked")
    }
}


async function eGet(key) {
    if (isLocked()) {
        var cipherText = await get(key)
        var secret = await chrome.storage.session.get(["en_locked"]).then((value) => value.en_locked)
        crypt.secret = secret
        var decipher = await crypt.decrypt(cipherText);
        return decipher
    } else {
        console.log("Error getting, app locked")
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
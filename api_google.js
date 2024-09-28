/////////////////
// GOOGLE UTIL //
/////////////////

let googleToken = null
let folderId = 'appDataFolder' // Content is invisble to the user

/////////////
// Sign In //
/////////////

async function onGoogleDriveSignIn(token) {
    googleToken = token

    showNotification("Signed in")
    const event = new CustomEvent('googleDriveSignIn', { detail: { googleToken: token} });
    console.log("Firing googleDriveSignIn")
    document.dispatchEvent(event);
    document.getElementById('sign-in-button').classList.add("hidden")
}

  function getGoogleToken() {
    if (googleToken === null) {
        throw new Error('Google token is null');
    } else {
        return googleToken;
    }
}

/////////////////////
// GOOGLE CONTACTS //
/////////////////////

///////////////////////
// Naming Convention //
///////////////////////
// 
//
// CSS 
// All IDs/Classes begin with: N/A
//
// JavaScript
// All Global function/variables begin with: gc
//

  async function gcGetContacts() {
    const response = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses", {
        headers: {
            "Authorization": `Bearer ${getGoogleToken()}`
        }
    });
    const contactsData = await response.json();

    if (contactsData && contactsData.connections && contactsData.connections.length > 0) {
        const contacts = contactsData.connections;
        console.debug("Contacts: ", contacts)
        return contacts
    } else {
        console.log("No contacts returned")
        console.log(contactsData)
        return [];
    }
}

async function gcGetContact(resourceName) {
    // Example resourceName: "people/asdhufhvweuifhc"
    try {
        const response = await fetch(`https://people.googleapis.com/v1/${resourceName}?personFields=addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined`, {
            headers: {
                "Authorization": `Bearer ${getGoogleToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const contactData = await response.json();
        console.debug("Contact: ", contactData);
        return contactData;
    } catch (error) {
        console.error("Failed to fetch contact:", error);
        return null; // or return an empty object, based on your preference
    }
}



async function gcUpdateContact(resourceName, newName) {
    const response = await fetch(`https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=names`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${googleToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            names: [{
                givenName: newName
            }]
        })
    });

    const updatedContact = await response.json();
    console.debug("Updated Contact:", updatedContact);
    return updatedContact;
}

//////////////////
// GOOGLE DRVIE //
//////////////////

///////////////////////
// Naming Convention //
///////////////////////
// 
//
// CSS 
// All IDs/Classes begin with: N/A
//
// JavaScript
// All Global function/variables begin with: gd
//

async function gdCreateFile(fileName, fileData) {
    const token = getGoogleToken();

    // File data to be uploaded
    const blobData = new Blob([fileData], { type: 'text/plain' });

    // File metadata
    const fileMetadata = {
        'name': fileName, // Replace with your file name
        'parents': [folderId],
        'mimeType': 'text/plain'
    };

    // Create new FormData instance
    let formData = new FormData();

    // Add the metadata and file data to the form
    formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    formData.append('file', blobData);

    // Create the fetch options
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    };

    try {
        // Send the request and log the full response
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', options);
        const data = await response.text();  // Read as text to catch non-JSON errors
        // console.log("Full response body:", data);

        // Parse response only if successful
        if (response.ok) {
            return JSON.parse(data).id;
        } else {
            throw new Error(`Error: ${data}`);
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}




async function gdUpdateFile(fileId, fileData) {
    token = getGoogleToken()

    // File data to be uploaded
    const blobData = new Blob([fileData], { type: 'text/plain' });

    // Create new FormData instance
    let formData = new FormData();

    // Add the metadata and file data to the form
    formData.append('file', blobData);

    // Create the fetch options
    const options = {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    };

    // Send the request
    fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, options)
        .then(response => response.json())
        .then(data => console.debug(data))
        .catch(error => console.error('Error:', error));

}

async function gdListFiles() {
    const token = getGoogleToken();

    // Create the fetch options
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };

    // Send the request to list files in the appData folder
    return fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder`, options)
        .then(response => response.json())
        .then(data => {
            if (data.files) {
                return data.files;
            } else {
                return [];
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return [];
        });
}
async function gdSearchFile(fileName) {
    const token = getGoogleToken();

    // Create the fetch options
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };

    // Correctly format the query
    const query = `name = '${fileName}'`;

    const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${encodeURIComponent(query)}`
    console.debug(url)
    // Send the request
    return fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if (data.files && data.files.length > 0) {
                return data.files[0].id;  // Return the ID of the first file found
            } else {
                console.log("No files found")
                return null;  // Return null if no files found
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return null;  // Return null in case of an error
        });
}

async function gdGetFile(fileId) {
    const token = getGoogleToken();

    // Fetch the file data as a blob from Google Drive
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };

    // Fetch file data from Google Drive
    return fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch file with ID ${fileId}: ${response.statusText}`);
            }
            return response
        })
        .catch(error => {
            console.error('Error fetching file:', error);
            return null;
        });
}

async function gdGetFileJSON(fileId) {
    const fileContents = await gdGetFile(fileId);

    // Convert the Blob to text
    const fileText = await fileContents.text();
    console.debug(`Raw File Contents for ${fileId}:`, fileText);

    // Strip text down to the first and last curly braces if needed
    let trimmedText = fileText.trim();
    if (!(trimmedText.startsWith('{') && trimmedText.endsWith('}'))) {
        console.debug("File needs trimming!")
        const firstBraceIndex = trimmedText.indexOf('{');
        const lastBraceIndex = trimmedText.lastIndexOf('}');
        if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
            trimmedText = trimmedText.substring(firstBraceIndex, lastBraceIndex + 1);
        }
        console.debug("Trimmed File contents:", trimmedText)
    }

    // Parse and log the contents as JSON, if it's JSON data
    try {
        return JSON.parse(trimmedText);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;  // Return null if parsing fails
    }
}




async function gdDeleteAllAppDataFiles() {
    try {
        const files = await gdListFiles()

        if (files.length === 0) {
            console.log('No files found in appDataFolder.');
            return;
        }

        // Step 2: Delete each file in the `appDataFolder`
        for (const file of files) {
            await gdDeleteFile(file.id);
            console.log(`Deleted file with ID: ${file.id}`);
        }

        console.log('All files in appDataFolder have been deleted.');
    } catch (error) {
        console.error('Error deleting files:', error);
    }
}

// Helper function to delete a file by ID
async function gdDeleteFile(fileId) {
    const token = getGoogleToken();

    const deleteOptions = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };

    try {
        const deleteResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, deleteOptions);

        if (!deleteResponse.ok) {
            throw new Error(`Failed to delete file with ID ${fileId}: ${deleteResponse.statusText}`);   
        } else {
            return true
        }

    } catch (error) {
        console.error('Error deleting file:', error);
    }
}


///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {
    
})

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    // On page load, check if the user is signed in
    chrome.identity.getAuthToken({interactive: false}, async function(token) {
        if (chrome.runtime.lastError) {
            // Handle error - for example, by showing a sign-in prompt to the user
            console.log(chrome.runtime.lastError.message);
            return;
        }
        if (token) {
            onGoogleDriveSignIn(token)
            
        }
    });
    // Handle Sign In button
    document.querySelector('#sign-in-button').addEventListener('click', async function() {
        chrome.identity.getAuthToken({interactive: true}, async function(token) {
          if (chrome.runtime.lastError) {
              // Handle error - for example, by showing a sign-in prompt to the user
              console.log(chrome.runtime.lastError.message);
              showNotification("Sign in failed.")
              return;
            }
          googleToken = token
          if (token) {
              onGoogleDriveSignIn(token)
          } else {
              showNotification("Sign in failed")
          }
        });
      });

})


////////////////////////
// DOMContentModified //
////////////////////////

// // Uncomment the below to add stuff after initial DOM Changes occur. It's a custom event. 
// document.addEventListener("DOMContentModified", function() {
    
// })

/////////////////
// tabsChanged //
/////////////////

// // Uncomment the below to add stuff after the URL changes. It's a custom event.
// document.addEventListener('tabsChanged', async (event) => {
//     const tab = event.detail.tab;
// })
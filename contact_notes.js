
async function populateContactSelect() {
    const contacts = await getGoogleContacts();

    contactSelect.innerHTML = "";
    
    const op1 = document.createElement('option');
    op1.textContent = "New Contact..."
    op1.value = "new-contact"
    contactSelect.appendChild(op1);

    // Check if there are any contacts returned
    contacts.forEach(contact => {
        // Check if the contact has a name
        if (contact.names && contact.names.length > 0) {
            const name = contact.names[0].displayName || "Unnamed Contact"; // Fallback for missing names
            
            // Create an option element
            const option = document.createElement('option');
            
            // Set option value as the contact's resource name (ID)
            option.value = contact.resourceName;
            
            // Set the display text as the contact's name
            option.textContent = name;
            
            // Append the option to the select element
            contactSelect.appendChild(option);
        }
    });
}

let currentContactFirstName
let currentContactLastName
let currentContactEmail
let currentContactCompany
let currentContactJobTitle 
let currentContactPhone
let currentContactAddressStreet;
let currentContactAddressCity;
let currentContactAddressRegion;
let currentContactAddressCountry;
let currentContactBirthdayDay;
let currentContactBirthdayMonth;
let currentContactBirthdayYear;


let currentContactNotes = {'value': ''}

let currentContactResourceName;
let currentContactEtag;

let contactNotesUl

// let contactRefreshButton
// let contactNewContactButton
let contactNewNoteButton
let contactSelect
    

async function selectContact() {
    resourceName = contactSelect.value
    await clearContact()
    if (resourceName == 'new-contact') {
        return
    }
    currentContactResourceName = resourceName
    if (resourceName) { // Should always be true now
        console.log("Attempting fetch of contact ", resourceName)
        contact = await getGoogleContact(resourceName);

        currentContactEtag = contact.etag

        // Set Attributes
        currentContactFirstName.value = contact.names?.length > 0 ? contact.names[0]?.givenName ?? "" : "";
        currentContactLastName.value = contact.names?.length > 0 ? contact.names[0]?.familyName ?? "" : "";
        currentContactEmail.value = contact.emailAddresses?.length > 0 ? contact.emailAddresses[0]?.value ?? "" : "";
        currentContactCompany.value = contact.organizations?.length > 0 ? contact.organizations[0]?.name ?? "" : "";
        currentContactJobTitle.value = contact.organizations?.length > 0 ? contact.organizations[0]?.title ?? "" : "";
        currentContactPhone.value = contact.phoneNumbers?.length > 0 ? contact.phoneNumbers[0]?.value ?? "" : "";
        currentContactAddressStreet.value = contact.addresses?.length > 0 ? contact.addresses[0]?.streetAddress ?? "" : ""; // Address street
        currentContactAddressCity.value = contact.addresses?.length > 0 ? contact.addresses[0]?.city ?? "" : ""; // Address city
        currentContactAddressRegion.value = contact.addresses?.length > 0 ? contact.addresses[0]?.region ?? "" : ""; // Address state/region
        currentContactAddressCountry.value = contact.addresses?.length > 0 ? contact.addresses[0]?.country ?? "" : ""; // Address country
        currentContactBirthdayDay.value = contact.birthdays?.length > 0 ? contact.birthdays[0]?.date?.day ?? "" : "";
        currentContactBirthdayMonth.value = contact.birthdays?.length > 0 ? contact.birthdays[0]?.date?.month ?? "" : "";
        currentContactBirthdayYear.value = contact.birthdays?.length > 0 ? contact.birthdays[0]?.date?.year ?? "" : "";

        currentContactNotes.value = contact.biographies?.length > 0 ? contact.biographies[0]?.value ?? "" : ""; // Notes

        addContactNotesToList(currentContactNotes.value)

    } else {
        console.log("Blank contact selected, clearing. ", resourceName)
    }
}

function clearContact() {
    currentContactFirstName.value = "";
    currentContactLastName.value = "";
    currentContactEmail.value = "";
    currentContactCompany.value = "";
    currentContactJobTitle.value = "";
    currentContactPhone.value = "";
    currentContactAddressStreet.value = ""; // Clear address street
    currentContactAddressCity.value = "";   // Clear address city
    currentContactAddressRegion.value = ""; // Clear address state/region
    currentContactAddressCountry.value = ""; // Clear address country
    currentContactNotes.value = "";
    currentContactBirthdayDay.value = "";
    currentContactBirthdayMonth.value = "";
    currentContactBirthdayYear.value = "";

    addContactNotesToList("")
}

function parseContactNoteWithFallback(note) {
    const notePattern = /-\[cr:(.*?)\]\[up:(.*?)\]-\n([\s\S]*?)\n---/g;
    const parsedNotes = [];
    const todayDate = new Date().toLocaleDateString(); // Get today's date in MM/DD/YYYY format

    let match;
    let lastIndex = 0; // Track the position of the last match

    // Use a while loop to match notes in the string
    while ((match = notePattern.exec(note)) !== null) {
        // Check for any text between lastIndex and the start of the current match (unformatted content)
        if (lastIndex < match.index) {
            const unformattedContent = note.slice(lastIndex, match.index).trim();
            if (unformattedContent) {
                parsedNotes.push({
                    created: todayDate,
                    updated: todayDate,
                    content: unformattedContent
                });
            }
        }

        // Extract the created date, updated date, and content from the current match
        const createdDate = match[1];
        const updatedDate = match[2];
        const content = match[3].trim();

        parsedNotes.push({
            created: createdDate,
            updated: updatedDate,
            content: content
        });

        // Update lastIndex to the end of the matched content
        lastIndex = notePattern.lastIndex;
    }

    // Check for any leftover content after the last match (if there was unmatched content)
    if (lastIndex < note.length) {
        const leftoverContent = note.slice(lastIndex).trim();
        if (leftoverContent) {
            parsedNotes.push({
                created: todayDate,
                updated: todayDate,
                content: leftoverContent
            });
        }
    }

    return parsedNotes;
}

function addBlankContactNote() {
    // TODO: Add on top of list
    addContactNoteJsonToList({
        content: "",
        created: new Date().toLocaleDateString(),
        updated: new Date().toLocaleDateString()
    }, true)
}

function addContactNoteJsonToList(note, addOnTop=false) {
        // Create a new li element
        const li = document.createElement('li');
        
        // Create a textarea element for the note content
        const textarea = document.createElement('textarea');
        textarea.classList.add('contact-notes-textarea');
        textarea.placeholder = "Contact note...";
        textarea.value = note.content; // Set the content
        
        // Create the div for timestamps
        const timestampsDiv = document.createElement('div');
        timestampsDiv.classList.add('timestamps');
        
        // Create the span for created timestamp
        const createdSpan = document.createElement('span');
        createdSpan.classList.add('created-timestamp');
        createdSpan.textContent = `Created: ${note.created}`; // Set created timestamp
        
        // Create the span for updated timestamp
        const updatedSpan = document.createElement('span');
        updatedSpan.classList.add('updated-timestamp');
        updatedSpan.textContent = `Updated: ${note.updated}`; // Set updated timestamp

        textarea.addEventListener("change", function() {
            updatedSpan.textContent = `Updated: ${new Date().toLocaleDateString()}`;
        })
        
        // Append elements to the li
        timestampsDiv.appendChild(createdSpan);
        timestampsDiv.appendChild(updatedSpan);
        li.appendChild(textarea);
        li.appendChild(timestampsDiv);
        
        // Append the li to the ul
        if (addOnTop) {
            contactNotesUl.insertBefore(li, contactNotesUl.firstChild);
        } else {
            contactNotesUl.appendChild(li);
        }
}

function addContactNotesToList(noteString) {
    // Split the noteString into an array of individual note strings
    let noteArray = parseContactNoteWithFallback(noteString);

    // Get the contact-notes-ul element
    contactNotesUl.innerHTML = ""; // Clear existing notes

    // Handle case where no notes exist
    if (noteArray.length === 0) {
        addBlankContactNote();
    } else {
        // Iterate over each note and add it to the list
        noteArray.forEach(note => {
            addContactNoteJsonToList(note);
        });
    }
}



function getContactNoteStringFromHTML() {
    const notesList = document.querySelectorAll('#contact-notes-ul li');
    let noteString = '';

    notesList.forEach(noteItem => {
        const textarea = noteItem.querySelector('textarea');
        const createdTimestamp = noteItem.querySelector('.created-timestamp').textContent.replace("Created: ", "").trim();
        const updatedTimestamp = noteItem.querySelector('.updated-timestamp').textContent.replace("Updated: ", "").trim();
        
        const noteContent = textarea.value.trim();
        if (noteContent) {
            // Format each note string
            noteString += `-[cr:${createdTimestamp}][up:${updatedTimestamp}]-\n`;
            noteString += `${noteContent}\n`;
            noteString += '---\n'; // End note separator
        }
    });

    return noteString.trim(); // Remove any trailing whitespace or newlines
}

async function saveContact() {
    const contactNoteString = getContactNoteStringFromHTML();
    const resourceName = contactSelect.value;

    // Check if creating a new contact
    if (resourceName === "new-contact") {
        const newContactResponse = await fetch(`https://people.googleapis.com/v1/people:createContact`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${googleToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                names: [{
                    givenName: currentContactFirstName.value,
                    familyName: currentContactLastName.value
                }],
                emailAddresses: [{
                    value: currentContactEmail.value
                }],
                organizations: [{
                    name: currentContactCompany.value,
                    title: currentContactJobTitle.value
                }],
                phoneNumbers: [{
                    value: currentContactPhone.value
                }],
                addresses: [{
                    streetAddress: currentContactAddressStreet.value,
                    city: currentContactAddressCity.value,
                    region: currentContactAddressRegion.value,
                    country: currentContactAddressCountry.value
                }],
                biographies: [{
                    value: contactNoteString,
                    contentType: "TEXT_PLAIN"
                }]
            })
        });

        if (!newContactResponse.ok) {
            const errorDetails = await newContactResponse.text();
            console.error('Error creating contact:', newContactResponse.statusText, errorDetails);
            showNotification('Error creating contact');
            return;
        }

        const createdContact = await newContactResponse.json();
        console.log("Created Contact:", createdContact);
        showNotification('Created contact successfully. Please wait...', 4);
        setTimeout(async function () {
            const option = document.createElement('option');
            option.value = createdContact.resourceName;
            option.textContent = createdContact.names[0].displayName || "Unnamed Contact";
            contactSelect.appendChild(option);
            contactSelect.value = createdContact.resourceName
            await selectContact(); // Adjust as necessary to show the new contact
        }, 3000)
        return createdContact;
    }

    // Proceed with updating an existing contact
    const response = await fetch(`https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=biographies,names,emailAddresses,organizations,phoneNumbers,addresses,birthdays`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${googleToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            biographies: [{
                value: contactNoteString,
                contentType: "TEXT_PLAIN"
            }],
            names: [{
                givenName: currentContactFirstName.value,
                familyName: currentContactLastName.value
            }],
            emailAddresses: [{
                value: currentContactEmail.value
            }],
            organizations: [{
                name: currentContactCompany.value,
                title: currentContactJobTitle.value
            }],
            phoneNumbers: [{
                value: currentContactPhone.value
            }],
            addresses: [{
                streetAddress: currentContactAddressStreet.value,
                city: currentContactAddressCity.value,
                region: currentContactAddressRegion.value,
                country: currentContactAddressCountry.value
            }],
            etag: currentContactEtag // Include the etag here
        })
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Error updating contact:', response.statusText, errorDetails);
        showNotification('Error updating contact');
        return;
    }

    const updatedContact = await response.json();
    console.log("Updated Contact:", updatedContact);
    showNotification('Updated contact successfully');
    selectContact();

    return updatedContact;
}





/*
Note Format

-[cr:9/21/2024][up:9/21/2024]-
Note contents
---
*/


///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {
    console.log("Running GoogleDriveSignIn")

    populateContactSelect()

    contactSelect.addEventListener("change", function() {
        selectContact()
    })

    contactSaveButton.addEventListener("click", saveContact)

    contactNewNoteButton.addEventListener("click", addBlankContactNote)

})


//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    currentContactFirstName = document.getElementById("contact-first-name");
    currentContactLastName = document.getElementById("contact-last-name");
    currentContactEmail = document.getElementById("contact-email");
    currentContactCompany = document.getElementById("contact-company");
    currentContactJobTitle = document.getElementById("contact-job-title");
    currentContactPhone = document.getElementById("contact-phone");
    currentContactAddressStreet = document.getElementById("contact-address-street"); // New
    currentContactAddressCity = document.getElementById("contact-address-city");   // New
    currentContactAddressRegion = document.getElementById("contact-address-region"); // New
    currentContactAddressCountry = document.getElementById("contact-address-country"); // New
    currentContactBirthdayDay = document.getElementById("contact-birthday-day");
    currentContactBirthdayMonth = document.getElementById("contact-birthday-month");
    currentContactBirthdayYear = document.getElementById("contact-birthday-year");

    contactNotesUl = document.getElementById('contact-notes-ul');
    

    // contactRefreshButton = document.getElementById("contact-notes-refresh");
    contactSaveButton = document.getElementById("contact-notes-save")
    // contactNewContactButton = document.getElementById("contact-notes-new-contact")
    contactNewNoteButton = document.getElementById("contact-notes-new-note")
    contactSelect = document.getElementById("contact-select");
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
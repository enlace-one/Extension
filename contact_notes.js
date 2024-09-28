///////////////////////
// Naming Convention //
///////////////////////
// 
//
// CSS 
// All IDs/Classes begin with: contact or contact-notes
//
// JavaScript
// All Global function/variables begin with: cn
//

///////////////
// Variables //
///////////////


let cnCurrentFirstName
let cnCurrentLastName
let cnCurrentEmail
let cnCurrentCompany
let cnCurrentJobTitle 
let cnCurrentPhone
let cnCurrentAddressStreet;
let cnCurrentAddressCity;
let cnCurrentAddressRegion;
let cnCurrentAddressCountry;
let cnCurrentBirthdayDay;
let cnCurrentBirthdayMonth;
let cnCurrentBirthdayYear;
let cnOpenTabButton;
let cnSavedStatusField;

let cnOpenInGoogleButton;

let cnContactNotesDiv

let cnOpenButton;
let cnSearchTable;
let cnSearchInput;
let cnNewContactButton;


let cnCurrentContactNotes = {'value': ''}

let cnCurrentContactResourceName = "new-contact";
let cnCurrentContactEtag;

let cnContactNotesUl

const cnQueryParam = "ContactGoogleId"

// let contactRefreshButton
// let contactNewContactButton
let cnNewNoteButton
// let cnContactSelect



// async function populateContactSelect() {
//     const contacts = await getGoogleContacts();

//     cnContactSelect.innerHTML = "";
    
//     const op1 = document.createElement('option');
//     op1.textContent = "New Contact..."
//     op1.value = "new-contact"
//     cnContactSelect.appendChild(op1);

//     // Check if there are any contacts returned
//     contacts.forEach(contact => {
//         // Check if the contact has a name
//         if (contact.names && contact.names.length > 0) {
//             const name = contact.names[0].displayName || "Unnamed Contact"; // Fallback for missing names
            
//             // Create an option element
//             const option = document.createElement('option');
            
//             // Set option value as the contact's resource name (ID)
//             option.value = contact.resourceName;
            
//             // Set the display text as the contact's name
//             option.textContent = name;
            
//             // Append the option to the select element
//             cnContactSelect.appendChild(option);
//         }
//     });
// }

async function cnOpenContact(contactGoogleId = null) {
    if (!contactGoogleId) {
        contactGoogleId = cnCurrentContactResourceName
    }
    await cnClearContact()
    cnCurrentContactResourceName = contactGoogleId
    if (contactGoogleId) { // Should always be true now
        console.log("Attempting fetch of contact ", contactGoogleId)
        contact = await gcGetContact(contactGoogleId);

        cnCurrentContactEtag = contact.etag

        // Set Attributes
        cnCurrentFirstName.value = contact.names?.length > 0 ? contact.names[0]?.givenName ?? "" : "";
        cnCurrentLastName.value = contact.names?.length > 0 ? contact.names[0]?.familyName ?? "" : "";
        cnCurrentEmail.value = contact.emailAddresses?.length > 0 ? contact.emailAddresses[0]?.value ?? "" : "";
        cnCurrentCompany.value = contact.organizations?.length > 0 ? contact.organizations[0]?.name ?? "" : "";
        cnCurrentJobTitle.value = contact.organizations?.length > 0 ? contact.organizations[0]?.title ?? "" : "";
        cnCurrentPhone.value = contact.phoneNumbers?.length > 0 ? contact.phoneNumbers[0]?.value ?? "" : "";
        cnCurrentAddressStreet.value = contact.addresses?.length > 0 ? contact.addresses[0]?.streetAddress ?? "" : ""; // Address street
        cnCurrentAddressCity.value = contact.addresses?.length > 0 ? contact.addresses[0]?.city ?? "" : ""; // Address city
        cnCurrentAddressRegion.value = contact.addresses?.length > 0 ? contact.addresses[0]?.region ?? "" : ""; // Address state/region
        cnCurrentAddressCountry.value = contact.addresses?.length > 0 ? contact.addresses[0]?.country ?? "" : ""; // Address country
        cnCurrentBirthdayDay.value = contact.birthdays?.length > 0 ? contact.birthdays[0]?.date?.day ?? "" : "";
        cnCurrentBirthdayMonth.value = contact.birthdays?.length > 0 ? contact.birthdays[0]?.date?.month ?? "" : "";
        cnCurrentBirthdayYear.value = contact.birthdays?.length > 0 ? contact.birthdays[0]?.date?.year ?? "" : "";

        cnCurrentContactNotes.value = contact.biographies?.length > 0 ? contact.biographies[0]?.value ?? "" : ""; // Notes

        cnAddContactNotesToList(cnCurrentContactNotes.value)

    } else {
        console.log("Blank contact selected, clearing. ", contactGoogleId)
    }
}

function cnClearContact() {
    cnCurrentFirstName.value = "";
    cnCurrentLastName.value = "";
    cnCurrentEmail.value = "";
    cnCurrentCompany.value = "";
    cnCurrentJobTitle.value = "";
    cnCurrentPhone.value = "";
    cnCurrentAddressStreet.value = ""; // Clear address street
    cnCurrentAddressCity.value = "";   // Clear address city
    cnCurrentAddressRegion.value = ""; // Clear address state/region
    cnCurrentAddressCountry.value = ""; // Clear address country
    cnCurrentContactNotes.value = "";
    cnCurrentBirthdayDay.value = "";
    cnCurrentBirthdayMonth.value = "";
    cnCurrentBirthdayYear.value = "";

    cnAddContactNotesToList("")
}

function cnParseContactNoteWithFallback(note) {
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

function cnAddBlankContactNote() {
    cnAddContactNoteJsonToList({
        content: "",
        created: new Date().toLocaleDateString(),
        updated: new Date().toLocaleDateString()
    }, true)
}

function cnAddContactNoteJsonToList(note, addOnTop=false) {
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
        makeSpanEditable(createdSpan)
        createdSpan.textContent = `Created: ${note.created}`; // Set created timestamp
        
        // Create the span for updated timestamp
        const updatedSpan = document.createElement('span');
        updatedSpan.classList.add('updated-timestamp');
        updatedSpan.classList.add("editableSpan")
        makeSpanEditable(updatedSpan)
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
            cnContactNotesUl.insertBefore(li, cnContactNotesUl.firstChild);
        } else {
            cnContactNotesUl.appendChild(li);
        }
}

function cnAddContactNotesToList(noteString) {
    // Split the noteString into an array of individual note strings
    let noteArray = cnParseContactNoteWithFallback(noteString);

    // Get the contact-notes-ul element
    cnContactNotesUl.innerHTML = ""; // Clear existing notes

    // Handle case where no notes exist
    if (noteArray.length === 0) {
        cnAddBlankContactNote();
    } else {
        // Iterate over each note and add it to the list
        noteArray.forEach(note => {
            cnAddContactNoteJsonToList(note);
        });
    }
}



function cnGetContactNoteStringFromHTML() {
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

async function cnSaveContact() {

    if (!cnCurrentFirstName.value) {
        showNotification("You must set a first name to save the contact")
        return
    }

    const contactNoteString = cnGetContactNoteStringFromHTML();
    const resourceName = cnCurrentContactResourceName;

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
                    givenName: cnCurrentFirstName.value,
                    familyName: cnCurrentLastName.value
                }],
                emailAddresses: [{
                    value: cnCurrentEmail.value
                }],
                organizations: [{
                    name: cnCurrentCompany.value,
                    title: cnCurrentJobTitle.value
                }],
                phoneNumbers: [{
                    value: cnCurrentPhone.value
                }],
                addresses: [{
                    streetAddress: cnCurrentAddressStreet.value,
                    city: cnCurrentAddressCity.value,
                    region: cnCurrentAddressRegion.value,
                    country: cnCurrentAddressCountry.value
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
        cnCurrentContactResourceName = createdContact.resourceName
        cnAddToContactSelectTable(createdContact)
        showNotification('Created contact successfully. Please wait...', 4);
        cnSetStatusSaved()
        setTimeout(function () {
            // location = "?ContactGoogleId=" + cnCurrentContactResourceName
            addQueryParamAndHash(cnQueryParam, cnCurrentContactResourceName, "contact-notes")
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
                givenName: cnCurrentFirstName.value,
                familyName: cnCurrentLastName.value
            }],
            emailAddresses: [{
                value: cnCurrentEmail.value
            }],
            organizations: [{
                name: cnCurrentCompany.value,
                title: cnCurrentJobTitle.value
            }],
            phoneNumbers: [{
                value: cnCurrentPhone.value
            }],
            addresses: [{
                streetAddress: cnCurrentAddressStreet.value,
                city: cnCurrentAddressCity.value,
                region: cnCurrentAddressRegion.value,
                country: cnCurrentAddressCountry.value
            }],
            etag: cnCurrentContactEtag // Include the etag here
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
    cnSetStatusSaved()
    // cnOpenContact();// Why was this here at all?

    return updatedContact;
}




async function cnAddToContactSelectTable(contact) {
    const name = contact.names[0].displayName || "Unnamed Contact";
    const company = contact.organizations?.length > 0 ? contact.organizations[0]?.name ?? "" : "";

    const row = document.createElement("tr"); // Changed 'row' to 'tr'
    const nameTd = document.createElement("td");
    const companyTd = document.createElement("td");

    // nameA.href = "?ContactGoogleId=" + contact.resourceName

    nameTd.addEventListener("click", function () {
        addQueryParamAndHash(cnQueryParam, contact.resourceName, "contact-notes");
    });

    nameTd.classList.add("blue-text")
    nameTd.innerText = truncateText(name, getTruncateCharLength());
    nameTd.setAttribute('data-full-text',name )

    companyTd.innerText = truncateText(company, getTruncateCharLength());
    companyTd.setAttribute('data-full-text',company)

    row.append(nameTd);
    row.append(companyTd);

    cnSearchTable.append(row);
}

async function cnPopulateContactsTable() {
    const contacts = await gcGetContacts();

    const sortedContacts = contacts.sort((a, b) => {
        const nameA = a.names[0].displayName || "Unnamed Contact";
        const nameB = b.names[0].displayName || "Unnamed Contact";
        return nameA.localeCompare(nameB);
    });

    // Clear existing rows
    cnSearchTable.innerHTML = `<tr>
                    <th>Name</th>
                    <th>Company</th>
                </tr>`;

    // const sortedPns = Object.values(pns).sort()

    Object.values(sortedContacts).forEach(async (contact) =>  {
        await cnAddToContactSelectTable(contact)
    });
}

async function cnSearchContacts() {
    const searchTerm = cnSearchInput.value.toLowerCase();
    const rows = cnSearchTable.querySelectorAll('tr');

    rows.forEach((row, index) => {
        // Skip the header row
        if (index === 0) return;

        const name = row.querySelector('td:first-child').getAttribute('data-full-text').toLowerCase();
        const company = row.querySelector('td:nth-child(2)').getAttribute('data-full-text').toLowerCase();

        if (name.includes(searchTerm) || company.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

async function cnGetContactFromURL() {
    console.log("Attempting to open contact from URL")
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('ContactGoogleId')) {
    console.log("ContactGoogleId found in url:", params.get(cnQueryParam))
    if (params.get(cnQueryParam) != "undefined") {
        return cnOpenContact(params.get(cnQueryParam))
    } else {
        console.error("ContactGoogleId in URL is undefined")
    }
  } else {
    return null
  }
}


async function cnNewContact() {
    cnCurrentContactResourceName = "new-contact"
    await cnClearContact()
    cnSetStatusUnsaved()
}

async function cnSetStatusSaved() {
    cnSavedStatusField.classList.remove("orange-ball")
    // cnSavedStatusField.innerText = "Saved."
}

async function cnSetStatusUnsaved() {
    cnSavedStatusField.classList.add("orange-ball")
    // cnSavedStatusField.innerText = "Unaved"
}


async function cnOpenContactInGoogle() {
    let url = "https://contacts.google.com/u/1/person/"
    let id = cnCurrentContactResourceName.split("/")[1]
    url = url + id
    window.open(url, '_blank');
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

    cnGetContactFromURL()
    cnPopulateContactsTable()

    contactSaveButton.addEventListener("click", cnSaveContact)

    cnNewNoteButton.addEventListener("click", cnAddBlankContactNote)


    pnOpenNoteButton.addEventListener("click", function () {
        pageNotesOpenTabButton.click()
        pnPopulateOpenNotesTable()
        pnSearchInput.focus()
    })


    cnOpenButton.addEventListener("click", function () {
        cnOpenTabButton.click()
        cnSearchInput.focus()
    })

    cnSearchInput.addEventListener("input", cnSearchContacts)


    cnNewContactButton.addEventListener("click", cnNewContact)

    cnContactNotesDiv.addEventListener("input", cnSetStatusUnsaved)

    cnContactNotesDiv.addEventListener("keydown", function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();  // Prevent default behavior (if necessary)
            cnSaveContact();     // Call the function
        }
    });

    cnOpenInGoogleButton.addEventListener("click", cnOpenContactInGoogle)

})

//////////////////////
// DOMContentLoaded //
//////////////////////

window.addEventListener("DOMContentLoaded", function() {
    cnCurrentFirstName = document.getElementById("contact-first-name");
    cnCurrentLastName = document.getElementById("contact-last-name");
    cnCurrentEmail = document.getElementById("contact-email");
    cnCurrentCompany = document.getElementById("contact-company");
    cnCurrentJobTitle = document.getElementById("contact-job-title");
    cnCurrentPhone = document.getElementById("contact-phone");
    cnCurrentAddressStreet = document.getElementById("contact-address-street"); // New
    cnCurrentAddressCity = document.getElementById("contact-address-city");   // New
    cnCurrentAddressRegion = document.getElementById("contact-address-region"); // New
    cnCurrentAddressCountry = document.getElementById("contact-address-country"); // New
    cnCurrentBirthdayDay = document.getElementById("contact-birthday-day");
    cnCurrentBirthdayMonth = document.getElementById("contact-birthday-month");
    cnCurrentBirthdayYear = document.getElementById("contact-birthday-year");
    cnOpenTabButton = document.querySelector("[data-tab='contact-notes-open-tab']");
    cnSavedStatusField = document.getElementById("contact-notes-saved-status")

    cnOpenInGoogleButton = document.getElementById("contact-open-in-google")
    
    cnSearchTable = document.getElementById("contact-notes-table")
    cnSearchInput = document.getElementById("contact-notes-search")
    cnNewContactButton = document.getElementById("contact-notes-new-contact")
    cnOpenButton = document.getElementById("contact-notes-open")

    cnContactNotesUl = document.getElementById('contact-notes-ul'); 

    cnContactNotesDiv = document.getElementById("contact-notes-div");
    

    // contactRefreshButton = document.getElementById("contact-notes-refresh");
    contactSaveButton = document.getElementById("contact-notes-save")
    // contactNewContactButton = document.getElementById("contact-notes-new-contact")
    cnNewNoteButton = document.getElementById("contact-notes-new-note")

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
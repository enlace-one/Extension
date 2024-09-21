
async function populateContactSelect(contact_select) {
    const contacts = await getGoogleContacts();

    contact_select.innerHTML = "";

    contact_select.appendChild(document.createElement('option'));

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
            contact_select.appendChild(option);
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


let contactRefreshButton
let contactSelect
    

async function selectContact(contact_select) {
    resourceName = contact_select.value
    await clearContact()
    if (resourceName) {
        console.log("Attempting fetch of contact ", resourceName)
        contact = await getGoogleContact(resourceName);

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

}


///////////////////////
// GoogleDriveSignIn //
///////////////////////

document.addEventListener("googleDriveSignIn", function() {
    console.log("Running GoogleDriveSignIn")

    populateContactSelect(contactSelect)

    contactRefreshButton.addEventListener("click", function() {
        populateContactSelect(contactSelect)
        showNotification("Refreshed Contacts")
    })

    contactSelect.addEventListener("change", function() {
        selectContact(contactSelect)
    })

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
    

    contactRefreshButton = document.getElementById("contact-notes-refresh");
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
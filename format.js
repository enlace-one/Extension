///////////////////////
// Naming Convention //
///////////////////////
// 
//
// CSS 
// All IDs/Classes begin with:
//
// JavaScript
// All Global function/variables begin with:
//

///////////////
// Variables //
///////////////
const exampleVar = 1;

///////////////
// Functions //
///////////////

var exampleDocumentElement;
function exampleFunc() {
    
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
    exampleDocumentElement = document.getElementById("example")

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
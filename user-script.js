// Get current url
var url = window.location.href;

// Check if url includes a certain phrase
if (url.includes("https://www.google.com/")) {
    console.log("This is a Google search results page");
}

// Set all links to open in a new tab
if (url.includes("https://xyz.abc.hij/")) {
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute('target', '_blank');
    }
}

// Trigger the page to refresh every 60 seconds
const continue_refreshing = true;
if (url.includes("https://klm.abc.hij/")) {
    function refresh(seconds=60) {
        setTimeout(function() {
            if (!continue_refreshing) {
                return;
            }
            location.reload();
            refresh(seconds);
        }, seconds * 1000);
    }
    refresh()
}

// Click a button in the dom every 60 seconds
if (url.includes("https://def.abc.hij/")) {
    function clickButton(seconds=60) {
        setTimeout(function() {
            if (!continue_refreshing) {
                return;
            }
            document.querySelector('#my_button').click();
            clickButton(seconds);
        }, seconds * 1000);
    }
    clickButton()

}
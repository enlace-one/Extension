# Coding Aid
## Javascript Events
### DOMContentLoaded
Most code runs after this is done.
### DOMContentModified
Some code runs after this if it is dependent on the modifications to JS in the first event.
### tabsChanged
This is what to watch for URL changes. 
### googleDriveSignIn
This occurs when GoogleDrive is signed into

## Custom Classes and Attributes
### [show-hide-class-on-click]
On click, toggle the 'hidden' class on elements of the specific class.
```html
<h1 show-hide-class-on-click="topics-show-hide">Topics</h1>
<textarea class="topics-show-hide"></textarea>
```
### [hover-text]
Shows the specified text on hover over
```html
<h1 hover-text="Topics are an example that I am using">Topics</h1>
```

### .copy-block
Adds a copy button beside the element
```html
<h1 class="copy-block"></h1>
```
### .copy-on-click
```html
<h1 class="copy-on-click"></h1>
```
### .dropdown-button
Shows/hides the following element
```html
<h1 class="dropdown-button"></h1>
<div></div>
```

### Tabs
```html
<a class="tab-button active" data-tab="about-tab">About</a>
<a class="tab-button" data-tab="settings-tab">Settings</a>

<div class="about-tab tab-content active"></div>
<div class="settings-tab tab-content"></div>
```

# Code Standards
## Naming Conventions
Javascript functions and variables: `variableName`
CSS Classes and IDs: `class-name`


# Planning Questions
How do I do contact notes/snippets? They would have no formating (at least if I want to store contact notes in the contacts themselves.)
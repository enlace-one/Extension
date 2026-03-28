# Coding Aid
## Javascript Events
### DOMContentLoaded
Most code runs after this is done.
### DOMContentModified
Some code runs after this if it is dependent on the modifications to JS in the first event.
### tabsChanged
This is what to watch for URL changes. 

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

# To Do 
This is not tracked as much anymore. It is mostly moved to my ToDo app.
+ Randomized salt
+ Copy box
+ Page Notes
+ Settings for encryption, etc
+ Intro Page
+ Regex
+ HTML
+ CSS refeence 
+ Page Notes search
- Javascript
- Clean up unused code
- Python?
- SQL?
- Quick-Reference? So you search something like "split" and git "textafter (excel)", "textbefore (excel)", "split (python)", etc. Checkboxes for what languages you have there. 

## To Do - Maybe
- Comparer 
- Dark mode
- Find&Replace
- Clipboard combiner - harder than it seems to read from clipboard
- Extra copy paste clipboard - harder than it seems to read from clipboard
- Custom keyboard shortcuts? Inject javascript? 

# Updating the Extension 
1. Update the version number and commit with that v#
2. Create a zip of Relevant files named as the version
3. Log into Chrome Developer Portal
4. Upload the extension and update docs as needed

# Changing Icon
1. Use https://alexleybourne.github.io/chrome-extension-icon-generator/ to change the size

# Adding New Images
1. Take the screenshot
2. Remove any identifying information
3. Resize with image resizer (powertoys) (right click) and don't ignore orientation. This will just make the height right usually.
4. Edit in Paint and adjust width as needed. 
5. Add text or anything else
6. Upload.

'use strict';

// Setup communication with script.js so we can access js objects of the page.
const s = document.createElement('script');
s.src = chrome.extension.getURL('src/script.js');
document.head.appendChild(s);
s.onload = function () {
    s.remove();
};

// the last textvalue emitted
let lastText = undefined;
// the last textvalue emitted that has been filtered
let lastFilteredText = undefined;

let userFilters = [];

// Diff_match_patch object
let dmp = new diff_match_patch();

// whether the plugin is active
let active = false;

// checks the first time whether the plugin is active
chrome.storage.sync.get(['active'], function (result) {
    active = result.active;
    if (active) {
        createPluginElement();
    }
});

// event listener for when the app becomes (in)active
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes['active']) {
        active = changes['active'].newValue;
        if (active) {
            createPluginElement();
        } else {
            removeSpellCheckElement();
        }
    }
});

// event listener for the user filters
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes['customRegex']) {
        userFilters = changes['customRegex'].newValue;
    }
});

// Receive events from script.js
document.addEventListener('return_command', function (e) {

  const message = JSON.parse(e.detail);

    // Currently the only value we are expecting is the editor value
    if (message.method === 'getValue') {
        let spellcheckContainer = getPluginElement();
        if (spellcheckContainer !== null) {
            const text = message.value;
            // const filteredText = text;
            const filteredText = filter(text);

            // Setting the last texts to we can access them later.
            lastText = text;
            lastFilteredText = filteredText;


            // Update the textarea if present and text has changed.
            const spellcheck = getSpellCheckTextElement()
            if (spellcheck !== null) {
                const current = document.activeElement;
                if (spellcheck.value !== filteredText) {
                    const scrollTop = spellcheck.scrollTop;
                    spellcheck.value = filteredText;
                    spellcheck.focus();
                    current.focus();
                    spellcheck.scrollTop = scrollTop;
                }
            }
        }
    }

});


// get the textvalue every two seconds
setInterval(() => {
  const message = JSON.stringify({method: 'getValue', args: []});

    document.dispatchEvent(new CustomEvent('call_command', {detail: message}));
}, 2000);




// returns a new DOM spellcheck element
function makeNewPluginElement() {
    const element = document.createElement('div');
    element.id = 'spellcheck';
    element.style.position = 'absolute';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.backgroundColor = 'Red';

    const textarea = document.createElement('textarea');
    textarea.id = 'spellcheck-text';
    textarea.style.width = '100%';
    textarea.style.height = 'calc(100% - 100px)';
    textarea.style.resize = 'none';
    element.append(textarea);

    const console = document.createElement('div');
    console.id = 'spellcheck-console';
    console.style.width = '100%';
    console.style.height = '50px';
    console.style.backgroundColor = 'rgb(249,249,249)';
    console.style.overflowY = 'Scroll';
    console.style.fontFamily = 'Courier New';
    console.style.fontSize = '12px';
    element.append(console);




    textarea.addEventListener('input', (event) => {
        inputChangeEvent(event)
    });


    return element;
}

function inputChangeEvent(event){
    const textarea = getSpellCheckTextElement();
    const newText = textarea.value;
    const temp = {a: lastFilteredText};
    const obj = JSON.stringify(temp);
    const oldText = JSON.parse(obj).a;

    if (newText === oldText) {
        return;
    }

    const newLines = newText.split('\n');
    const oldLines = oldText.split('\n');
    if (newLines.length !== oldLines.length) {
        console.log('Nummer of lines is not equal. Cound not apply rhe fix');
    } else {
        for (let i = 0; i < newLines.length; i++) {
            const newLine = newLines[i];
            const oldLine = oldLines[i];

            if (newLine !== oldLine) {
                const patches = dmp.patch_make(oldLine, newLine);

                const fixed = dmp.patch_apply(patches, lastText.split('\n')[i])[0];
                const message = JSON.stringify({method: 'replaceLine', args: {lineNumber: i, newValue: fixed}});
                document.dispatchEvent(new CustomEvent('call_command',
                    {detail: message}
                ));
            }
        }
    }
}





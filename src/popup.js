'use strict';

let customRegex = [];


document.addEventListener('DOMContentLoaded', function () {
    let activeCheckbox = document.getElementById('active');

    chrome.storage.sync.get(['active'], function(result) {
        activeCheckbox.checked = result.active || false;
    });

    chrome.storage.sync.get(['customRegex'], function(result) {
        customRegex = result.customRegex || [];

        for(let i = 0; i < customRegex.length; i++){
            addRegexToPopup(customRegex[i].pattern, customRegex[i].newValue, i);
        }
    });

    activeCheckbox.addEventListener('change', function(){
        if(this.checked){
            chrome.storage.sync.set({active: true}, function() {
            });
        }else{
            chrome.storage.sync.set({active: false}, function() {
            });
        }
    });

    // Adds the regex whenever the user clciks the button
    const addRegexButton = document.getElementById('regex-button-add');
    addRegexButton.addEventListener("click", () => {
        const regexString = document.getElementById('regex').value;
        const replace = document.getElementById('value').value;

        customRegex.push({pattern: regexString, newValue: replace});
        chrome.storage.sync.set({customRegex: customRegex}, function() { });
        addRegexToPopup(regexString, replace, customRegex, length - 1);

        document.getElementById('regex').value = '';
        document.getElementById('value').value = '';
    });

    // Open filter help link when clicked
    const helpFilterLink = document.getElementById('help-filter-link');
    helpFilterLink.addEventListener("click", () => {
        chrome.tabs.create({url: helpFilterLink.getAttribute('href')});
    });

    const donateLink = document.getElementById('donate-link');
    donateLink.addEventListener("click", () => {
        chrome.tabs.create({url: 'https://www.paypal.com/donate/?hosted_button_id=6B3GESXVWUPAJ'});
    });






});



// Adds a newly added regex to the popup.
function addRegexToPopup(regexString, replaceString, index){
    const container = document.getElementById('regex-container');
    const row = document.createElement('div');

    row.style.display = 'flex';
    container.append(row);

    const inputRegex = document.createElement('input');
    inputRegex.type = 'text';
    inputRegex.id = 'regex-' + customRegex.length;
    inputRegex.disabled = true;
    inputRegex.value = regexString;

    const inputReplace = document.createElement('input');
    inputReplace.type = 'text';
    inputReplace.id = 'value-' + customRegex.length;
    inputReplace.disabled = true;
    inputReplace.value = replaceString;

    const buttonDelete = document.createElement('button');
    buttonDelete.id = 'regex-button-delete-' + index;
    buttonDelete.innerText = '-';
    buttonDelete.addEventListener('click', () => {
        deleteRegex(index);
    })

    row.append(inputRegex);
    row.append(inputReplace);
    row.append(buttonDelete);
}

// Delete a specific element. Save the new list and rebuild the popup regexes.
function deleteRegex(index) {
    customRegex.splice(index, 1);
    chrome.storage.sync.set({customRegex: customRegex}, function() { });
    const container = document.getElementById('regex-container');
    container.innerHTML = '';
    for(let i = 0; i < customRegex.length; i++){
        addRegexToPopup(customRegex[i].pattern, customRegex[i].newValue, i);
    }
}

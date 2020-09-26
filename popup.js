'use strict';

document.addEventListener('DOMContentLoaded', function () {
    let activeCheckbox = document.getElementById('active');

    chrome.storage.sync.get(['active'], function(result) {
        activeCheckbox.checked = result.active;
    });

    activeCheckbox.addEventListener('change', function(){
        if(this.checked){
            chrome.storage.sync.set({active: true}, function() {
                console.log('set active true');
            });
        }else{
            chrome.storage.sync.set({active: false}, function() {
                console.log('set active false');
            });
        }
    });
});

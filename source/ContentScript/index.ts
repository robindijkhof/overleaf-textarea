import {createPluginElement, createPluginButtonElement, getSpellCheckTextElement, removePluginElement} from "../dom-helper";
import {SpellcheckController} from "./spellcheck-controller";
import {Filter} from "../Popup/filter";
import {browser} from 'webextension-polyfill-ts';


const controller = SpellcheckController.getInstance();

let userFilters: Filter[] = [];
// whether the plugin is active on the current page
let activeOnPage = true;
// whether scroll between overleaf and textarea should be synced
let syncScroll = false;

// get the plugin icon as the button image
let buttonIcon = browser.runtime.getURL('assets/icons/icon_18.png');

// Setup communication with script.js so we can access js objects of the page.
const s = document.createElement('script');
s.src = browser.runtime.getURL('js/page-script.bundle.js');
document.head.appendChild(s);
s.onload = () => {
  s.remove();
};

// handles state changes for both active flags
function onAnyStateChanged(globalActive: boolean, pageActive: boolean) {
  let active = globalActive && pageActive;
  if (active) {
    createPluginElement();
    createPluginButtonElement(buttonIcon, onPluginButtonClick);
    getSpellCheckTextElement()?.addEventListener('input', () => {
      controller.textAreaInputChangeEvent()
    });
    setTextareaScrollListener();
    getSpellCheckTextElement()?.focus();
  } else {
    removePluginElement();
  }
}

// click event for the plugin button
function onPluginButtonClick() {
  browser.storage.sync.get(['active']).then(result => {
    activeOnPage = !activeOnPage;
    onAnyStateChanged(result.active, activeOnPage);
  });
}

// checks the first time whether the plugin is active
browser.storage.sync.get(['active']).then(result => {
  let active = (result.active === undefined ? true : result.active) && activeOnPage;
  if (active) {
    createPluginElement();
    createPluginButtonElement(buttonIcon, onPluginButtonClick);
    getSpellCheckTextElement()?.addEventListener('input', () => {
      controller.textAreaInputChangeEvent()
    });
    setTextareaScrollListener();

    //Timeout because grammarly has not loaded yet.
    setTimeout(() => {
      const textarea = getSpellCheckTextElement();
      if(textarea){
        const current = document.activeElement;
        getSpellCheckTextElement()!.selectionEnd = 1;
        getSpellCheckTextElement()?.focus();

        (current as HTMLElement)?.focus();
      }
    }, 2000)
  }
});

// event listener for when the app becomes (in)active
browser.storage.onChanged.addListener(changes => {
  if (changes['active']) {
    onAnyStateChanged(changes['active'].newValue, activeOnPage);
  }
});

// checks the first time
browser.storage.sync.get(['syncScroll']).then(result => {
  syncScroll = result.syncScroll === undefined ? true : result.syncScroll;
});
browser.storage.onChanged.addListener(changes => {
  if (changes['syncScroll']) {
    syncScroll = changes['syncScroll'].newValue;
  }
});


// checks the first time
browser.storage.sync.get(['customRegex']).then(result => {
  userFilters = result.customRegex || [];
});

// event listener for the user filters
browser.storage.onChanged.addListener(changes => {
  if (changes['customRegex']) {
    userFilters = changes['customRegex'].newValue;
  }
});


let aside = document.querySelector('aside.editor-sidebar');
aside?.addEventListener("click", () => {
  browser.storage.sync.get(['active']).then(result => {
    if (activeOnPage) {
      onAnyStateChanged(result.active, false);
      setTimeout(() => {
        onAnyStateChanged(result.active, true);
      }, 1000);
    }
  });
});

// Sync overleaf scroll to textarea
document.addEventListener('overleaf_scroll', e => {
  // @ts-ignore
  const percentage = e.detail;
  const textarea = getSpellCheckTextElement();
  if (textarea && syncScroll) {
    textarea.scrollTop = textarea.scrollHeight * (percentage / 100);
  }
});

// get the textvalue every two seconds
setInterval(() => {
  const message = JSON.stringify({method: 'getValue', args: []});
  document.dispatchEvent(new CustomEvent('call_command', {detail: message}));
}, 2000);

// Receive events from script.js
document.addEventListener('return_command', function (e) {
  // @ts-ignore
  const message = JSON.parse(e.detail);
  controller.handleOverleafReturnCommand(message, userFilters);
});

//Send textarea scroll event
function setTextareaScrollListener() {
  const textarea = getSpellCheckTextElement();
  if (textarea) {
    // Sync scroll from overleaf
    textarea.addEventListener('scroll', function () {
      if (syncScroll) {
        const percentage = textarea.scrollTop / textarea.scrollHeight * 100;
        if(textarea.scrollTop != 0){ // Sometimes this value is incorrectly 0. In this case we don't want to send a scoll event.
          document.dispatchEvent(new CustomEvent('textarea_scroll', {detail: percentage}));
        }
      }
    });
  }
}


export {}




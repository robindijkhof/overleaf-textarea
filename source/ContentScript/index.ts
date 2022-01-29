import {createPluginElement, createPluginButtonElement, getPluginButtonElement, getSpellCheckTextElement, removePluginElement} from "../dom-helper";
import {SpellcheckController} from "./spellcheck-controller";
import {Filter} from "../Popup/filter";
import {browser} from 'webextension-polyfill-ts';


const controller = SpellcheckController.getInstance();

let userFilters: Filter[] = [];
// whether scroll between overleaf and textarea should be synced
let syncScroll = false;

// get the plugin icon as the button image using the overleaf theme as a guide
let theme = document.querySelector('select[name=overallTheme]') as HTMLSelectElement;
let buttonIcon = getButtonIconAssetURL(theme.value);

// Setup communication with script.js so we can access js objects of the page.
const s = document.createElement('script');
s.src = browser.runtime.getURL('js/page-script.bundle.js');
document.head.appendChild(s);
s.onload = () => {
  s.remove();
};

// Select the proper button icon for the overleaf theme
function getButtonIconAssetURL(themeValue: string) {
  let asset = 'assets/icons/icon_18_white.png';

  if (themeValue == 'string:light-') {
    asset = 'assets/icons/icon_18.png';
  }

  return browser.runtime.getURL(asset);
}

// handles the state change of the active flag
function onActiveStateChanged(active: boolean) {
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
    let active = !result.active;
    browser.storage.sync.set({'active': active})
  });
}

// checks the first time whether the plugin is active
browser.storage.sync.get(['active']).then(result => {
  let active = result.active === undefined ? true : result.active;
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
    onActiveStateChanged(changes['active'].newValue);
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
    if (result.active) {
      onActiveStateChanged(result.active);
      setTimeout(() => {
        onActiveStateChanged(result.active);
      }, 1000);
    }
  });
});

// update the button icon with the theme
theme.addEventListener("change", e => {
  let select = e.target as HTMLSelectElement;
  let buttonIcon = getButtonIconAssetURL(select.value);
  let button = getPluginButtonElement();
  button?.setAttribute('src', buttonIcon);
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




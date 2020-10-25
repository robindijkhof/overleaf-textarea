'use strict';

chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.url.match("www.overleaf.com")) {
            chrome.pageAction.show(tabId);
        }
    });
});

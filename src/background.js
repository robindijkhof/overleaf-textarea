'use strict';



chrome.runtime.onInstalled.addListener(function () {

  try{
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          // pageUrl: {urlMatches: '*://*.overleaf.com/project/*'},
          pageUrl: {urlMatches: '(?:http(?:s)?):(?:\/\/)?(?:www\.)?(?:.*?)overleaf\.com\/project\/.*$'},
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  } catch (e) {
    // chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //   if (changeInfo.status === 'complete' && tab.url.match("www.overleaf.com")) {
    //     chrome.pageAction.show(tabId);
    //   }else{
    //     chrome.pageAction.hide(tabId);
    //   }
    // });
  }


});

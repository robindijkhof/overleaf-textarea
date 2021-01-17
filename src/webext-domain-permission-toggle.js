/* https://github.com/fregante/webext-domain-permission-toggle @ v1.1.0 */

var addDomainPermissionToggle = (function () {
  'use strict';

  async function getManifestPermissions() {
    return getManifestPermissionsSync();
  }
  function getManifestPermissionsSync() {
    var _a, _b;
    const manifest = chrome.runtime.getManifest();
    const manifestPermissions = {
      origins: [],
      permissions: []
    };
    const list = new Set([
      ...((_a = manifest.permissions) !== null && _a !== void 0 ? _a : []),
      ...((_b = manifest.content_scripts) !== null && _b !== void 0 ? _b : []).flatMap(config => { var _a; return (_a = config.matches) !== null && _a !== void 0 ? _a : []; })
    ]);
    for (const permission of list) {
      if (permission.includes('://')) {
        manifestPermissions.origins.push(permission);
      }
      else {
        manifestPermissions.permissions.push(permission);
      }
    }
    return manifestPermissions;
  }

  const contextMenuId = 'webext-domain-permission-toggle:add-permission';
  let currentTabId;
  let globalOptions;
  async function p(namespace, function_, ...args) {
    if (window.browser) {
      return browser[namespace][function_](...args);
    }
    return new Promise((resolve, reject) => {
      chrome[namespace][function_](...args, result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        else {
          resolve(result);
        }
      });
    });
  }
  async function executeCode(tabId, function_, ...args) {
    return p('tabs', 'executeScript', tabId, {
      code: `(${function_.toString()})(...${JSON.stringify(args)})`
    });
  }
  async function isOriginPermanentlyAllowed(origin) {
    return p('permissions', 'contains', {
      origins: [
        origin + '/*'
      ]
    });
  }
  function createMenu() {
    chrome.contextMenus.remove(contextMenuId, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: contextMenuId,
      type: 'checkbox',
      checked: false,
      title: globalOptions.title,
      contexts: [
        'page_action',
        'browser_action'
      ],
      documentUrlPatterns: [
        'http://*/*',
        'https://*/*'
      ]
    });
  }
  function updateItem({ tabId }) {
    chrome.tabs.executeScript(tabId, {
      code: 'location.origin'
    }, async ([origin] = []) => {
      const settings = {
        checked: false,
        enabled: true
      };
      if (!chrome.runtime.lastError && origin) {
        const manifestPermissions = await getManifestPermissions();
        const isDefault = manifestPermissions.origins.some(permission => permission.startsWith(origin));
        settings.enabled = !isDefault;
        settings.checked = isDefault || await isOriginPermanentlyAllowed(origin);
      }
      chrome.contextMenus.update(contextMenuId, settings);
    });
  }
  async function togglePermission(tab, toggle) {
    const safariError = 'The browser didn\'t supply any information about the active tab.';
    if (!tab.url && toggle) {
      throw new Error(`Please try again. ${safariError}`);
    }
    if (!tab.url && !toggle) {
      throw new Error(`Couldn't disable the extension on the current tab. ${safariError}`);
    }
    const permissionData = {
      origins: [
        new URL(tab.url).origin + '/*'
      ]
    };
    if (!toggle) {
      return p('permissions', 'remove', permissionData);
    }
    const userAccepted = await p('permissions', 'request', permissionData);
    if (!userAccepted) {
      chrome.contextMenus.update(contextMenuId, {
        checked: false
      });
      return;
    }
    if (globalOptions.reloadOnSuccess) {
      void executeCode(tab.id, (message) => {
        if (confirm(message)) {
          location.reload();
        }
      }, globalOptions.reloadOnSuccess);
    }
  }
  async function handleClick({ checked, menuItemId }, tab) {
    if (menuItemId !== contextMenuId) {
      return;
    }
    try {
      await togglePermission(tab, checked);
    }
    catch (error) {
      if (tab === null || tab === void 0 ? void 0 : tab.id) {
        executeCode(tab.id, 'alert' , String(error)).catch(() => {
          alert(error);
        });
        updateItem({ tabId: tab.id });
      }
      throw error;
    }
  }
  function addDomainPermissionToggle(options) {
    if (globalOptions) {
      throw new Error('webext-domain-permission-toggle can only be initialized once');
    }
    const { name } = chrome.runtime.getManifest();
    globalOptions = { title: `Enable ${name} on this domain`,
      reloadOnSuccess: `Do you want to reload this page to apply ${name}?`, ...options };
    chrome.contextMenus.onClicked.addListener(handleClick);
    chrome.tabs.onActivated.addListener(updateItem);
    chrome.tabs.onUpdated.addListener((tabId, { status }) => {
      if (currentTabId === tabId && status === 'complete') {
        updateItem({ tabId });
      }
    });
    createMenu();
  }

  return addDomainPermissionToggle;

}());

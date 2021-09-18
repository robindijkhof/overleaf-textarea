import 'emoji-log';
import {browser} from 'webextension-polyfill-ts';
import 'webext-dynamic-content-scripts';
import addDomainPermissionToggle from "webext-domain-permission-toggle";
//
addDomainPermissionToggle();


browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});

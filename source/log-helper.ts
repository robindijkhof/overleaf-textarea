import {getConsoleElement} from "./dom-helper";

export function log(message: string): void {
  const consoleElement = getConsoleElement();
  if (consoleElement !== null) {
    consoleElement.style.display = '';
    const logLine = document.createElement('span');
    logLine.innerHTML = new Date().toISOString() + '   ' + sanitize(message) + '<br>';
    logLine.style.overflowY = 'scroll';
    consoleElement.insertBefore(logLine, consoleElement.childNodes[0]);
  }
}

function sanitize(string: string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
    "`": '&grave;',
  };
  const reg = /[&<>"'/]/ig;

  return string.replace(reg, match => ((map as any)[match]));
}

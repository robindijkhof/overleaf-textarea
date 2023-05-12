// removes the plugin DOM element
export function removePluginElement(): void {
  const spellcheckContainer = getPluginElement();
  if (spellcheckContainer !== null) {
    spellcheckContainer.parentElement?.removeChild(spellcheckContainer);
  }
}

// returns the plugin DOM element
export function getPluginElement() {
  return document.getElementById('spellcheck');
}

// returns the plugin textarea element
export function getSpellCheckTextElement(): HTMLTextAreaElement | null {
  return document.getElementById('spellcheck-text') as HTMLTextAreaElement;
}


// Adds a plugin element to the DOM
export function createPluginElement(): void {
  const pdfdoc = document.querySelector("div.full-size.pdf");
  if (getPluginElement() === null) {
    pdfdoc?.append(makeNewPluginElement());
  }
}

//Returns the console element
export function getConsoleElement(): HTMLElement | null {
  return document.getElementById('spellcheck-console');
}

// creates and returns the plugin DOM element
function makeNewPluginElement() {
  const element = document.createElement('div');
  element.id = 'spellcheck';
  element.style.position = 'absolute';
  element.style.width = '100%';
  element.style.height = '100%';
  element.style.display = 'flex';
  element.style.flexFlow = 'column';
  element.style.backgroundColor = 'Red';
  element.style.zIndex = '10';


  const textarea = document.createElement('textarea');
  textarea.id = 'spellcheck-text';
  textarea.style.width = '100%';
  textarea.style.height = 'calc(100% - 30px)';
  textarea.style.resize = 'none';
  element.append(textarea);

  const userConsole = document.createElement('div');
  userConsole.id = 'spellcheck-console';
  userConsole.style.marginTop = '6px';
  userConsole.style.marginBottom = '50px';
  userConsole.style.width = '100%';
  userConsole.style.height = '100px';
  userConsole.style.backgroundColor = 'rgb(249,249,249)';
  userConsole.style.overflowY = 'Scroll';
  userConsole.style.fontFamily = 'Courier New';
  userConsole.style.fontSize = '12px';
  userConsole.style.display = 'none';
  element.append(userConsole);

  //Add some padding to match the empty page overleaf creates.
  setTimeout(() => {
    const height = window.innerHeight|| document.documentElement.clientHeight||
      document.body.clientHeight;
    textarea.style.paddingBottom = height - 50 + 'px';
  }, 1000);



  return element;
}

export function fixWeirdGrammarlyErrorPosition(){
  // @ts-ignore
  const element = document.getElementsByTagName('grammarly-mirror')[0]?.shadowRoot?.querySelector('div');
  if(element){
    element.style.overflow='auto';
  }
}

export function getOverleafScrollElement(){
  //@ts-ignore;
  return _ide.editorManager.$scope.editor.sharejs_doc?.cm6?.view?.scrollDOM;
}

export function getOverleafEditorHasFocus(mouseX: number, mouseY: number){
  const element = document.querySelector('.cm-editor');
  return elementHasFocus(element, mouseX, mouseY);
}

export function getTextAreaHasFocus(mouseX: number, mouseY: number){
  const element = getSpellCheckTextElement();
  return elementHasFocus(element, mouseX, mouseY);
}

function elementHasFocus(element: Element | null, mouseX: number, mouseY: number){
  const box = element?.getBoundingClientRect();
  if(box){
    return box.x < mouseX && (box.x + box.width) > mouseX && box.y < mouseY && (box.y + box.height) > mouseY;
  }

  return false;
}

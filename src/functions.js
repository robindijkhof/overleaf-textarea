// removes the spellcheck DOM element
function removeSpellCheckElement() {
  const spellcheckContainer = getPluginElement();
  if (spellcheckContainer !== null) {
    spellcheckContainer.parentElement.removeChild(spellcheckContainer);
  }
}

// returns the spellcheck DOM element
function getPluginElement() {
  return document.getElementById('spellcheck');
}

// returns the spellcheck textarea element
function getSpellCheckTextElement() {
  return document.getElementById('spellcheck-text');
}

// Adds a spellcheck element to the DOM
function createPluginElement() {
  const pdfdoc = document.querySelector("div.full-size.pdf");
  if (getPluginElement() === null) {
    pdfdoc.append(makeNewPluginElement());
  }
}


function getConsoleElement() {
  return document.getElementById('spellcheck-console');
}

function log(message) {
  const consoleElement = getConsoleElement();
  if (consoleElement !== null) {
    consoleElement.style.display = '';
    const logLine = document.createElement('span');
    logLine.innerHTML = new Date().toISOString() + '   ' + sanitize(message) + '<br>';
    logLine.style.overflowY = 'scroll';
    consoleElement.insertBefore(logLine, consoleElement.childNodes[0]);
  }
}

function sanitize(string) {
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
  return string.replace(reg, (match) => (map[match]));
}

// Filter the text. Commandos should be removed so Grammarly can understand the text.
// The number of lines should not be affected. This will cause the plugin not to work.
function filter(text) {
  let regexes = userFilters.concat(
    [
      {pattern: /w*(?<!\\)%.*(\n?)/g, newValue: '$1'},
      {pattern: '\\\\', newValue: ''},
      {pattern: '\\%', newValue: '%'},
      {pattern: '\\$', newValue: '$'},
      {pattern: '\\&', newValue: '&'},
      {pattern: '\\#', newValue: '#'},
      {pattern: '\\_', newValue: '_'},
      {pattern: /(\\author{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\begin{)(.*?)(})(\[.*?])?/g, newValue: ''},
      {pattern: /(\\bibliography{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\bibliographystyle{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\caption{)(.*?)(})/g, newValue: ''},
      {pattern: '\\centering', newValue: ''},
      {pattern: '\\par', newValue: ''},
      {pattern: /( \\cite{)(.*?)(} )/g, newValue: ' '},
      {pattern: /( \\cite{)(.*?)(}.)/g, newValue: '.'},
      {pattern: /(\\cite{)(.*?)(})/g, newValue: ''},
      {pattern: /( \\citep{)(.*?)(} )/g, newValue: ' '},
      {pattern: /( \\citep{)(.*?)(}.)/g, newValue: '.'},
      {pattern: /(\\citep{)(.*?)(})/g, newValue: ''},
      {pattern: /( \\citeal\[]{)(.*?)(} )/g, newValue: ' '},
      {pattern: /( \\citeal\[]{)(.*?)(}.)/g, newValue: '.'},
      {pattern: /(\\citeal\[]{)(.*?)(})/g, newValue: ''},
      {pattern: /( \\citealp\[]{)(.*?)(} )/g, newValue: ' '},
      {pattern: /( \\citealp\[]{)(.*?)(}.)/g, newValue: '.'},
      {pattern: /(\\citealp\[]{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\citestyle{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\date{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\documentclass{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\end{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\includegraphics\[(.*?)]{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\input{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\keywords{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\label\[]{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\label{)(.*?)(})/g, newValue: ''},
      {pattern: '\\maketitle', newValue: ''},
      {pattern: /(\\numberofauthors{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\pagenumbering{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\pagestyle{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\ref{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\autoref{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\chapter{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\section{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\subsection{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\subsubsection{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\textit{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\title{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\usepackage\[(.*?)]{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\usepackage{)(.*?)(})/g, newValue: ''},
      {pattern: /(\\gls{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\acrshort{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\acrfull{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\paragraph{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\ac[s|l|f]{0,1}[p]?{)(.*?)(})/g, newValue: '$2'},
      {pattern: /(\\todo{)(.*?)(})/g, newValue: ''}

    ]);

  //Dedupe. Keep the first specified by the user.
  regexes = uniqByKeepFirst(regexes, x => String(x.pattern));

  for (let i = 0; i < regexes.length; i++) {
    if(regexes[i].newValue === '%%EMPTY%%') {
      continue;
    }

    const regex = getRegFromString(regexes[i].pattern);
    let newText = '';
    if (typeof regex === 'string') {
      newText = text.replaceAll(regex, regexes[i].newValue);
    } else {
      newText = text.replace(regex, regexes[i].newValue);
    }

    if (newText.split("\n").length === text.split("\n").length) {
      text = newText
    } else {
      let patternString = regexes[i].pattern;
      if(typeof patternString !== 'string'){
        patternString = String(patternString);
      }

      let newValueString = regexes[i].newValue;
      if(typeof newValueString !== 'string'){
        newValueString = String(newValueString);
      }

      // Note, logs are reversed.
      log('If you don\'t know what to do, add the following filter: ' + patternString + ' with value: %%EMPTY%%');
      log('If this is custom filter, remove or update it. If it is not a custom filter, try to fix it by overriding it.');
      log('Pattern incorrect. Text length reduced by :' + patternString + ', ' + newValueString);
    }

  }
  return text;

}

// Creates a regex from the provided string. If fails, return the original string or original regex.
function getRegFromString(string) {
  try {
    const a = string.split("/");
    const modifiers = a.pop();
    a.shift();
    const pattern = a.join("/");
    return new RegExp(pattern, modifiers);
  } catch (e) {
    return string;
  }
}

// filters a list of objects by a specified key.
function uniqByKeepFirst(a, key) {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

// For testing purposes
try {
  module.exports = {
    filter: filter,
  };
} catch (e) {

}

if (!String.prototype.replaceAll) {
  // NodeJS does not support replaceAll
  String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
  };
}





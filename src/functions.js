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
        log('Hi there');
    }
}

function getConsoleElement(){
    return document.getElementById('spellcheck-console');
}

function log(message){
    const consoleElement = getConsoleElement();
    if(consoleElement !== null){
        const logLine = document.createElement('span');
        logLine.innerHTML = new Date().toISOString() + '   ' + message + '<br>';
        logLine.style.overflowY = 'scroll';
        consoleElement.insertBefore(logLine, consoleElement.childNodes[0]);
    }
}

// Filter the text. Commandos should be removed so Grammarly can understand the text.
// The number of lines should not be affected. This will cause the plugin not to work.
function filter(text) {
    const regexes = [
        {pattern: /w*(?<!\\)%.*\n?/g, newValue: '\n'},
        {pattern: '\\\\', newValue: ''},
        {pattern: '\\\\*', newValue: ''},
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
        {pattern: /(\\cite{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\citep{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\citeal\[]{)(.*?)(})/g, newValue: ''},
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
        {pattern: /(\\autored{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\section{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\subsection{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\textit{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\title{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\usepackage\[(.*?)]{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\usepackage{)(.*?)(})/g, newValue: ''},
    ].concat(userFilters);

    for (let i = 0; i < regexes.length; i++) {
        const newText = text.replaceAll(regexes[i].pattern, regexes[i].newValue);
        if (newText.split("\n").length === text.split("\n").length) {
            text = newText
        } else {
            log('Pattern incorrect. Text length reduced by :' + regexes[i].pattern + ', ' + regexes[i].newValue)
        }
    }
    return text;

}

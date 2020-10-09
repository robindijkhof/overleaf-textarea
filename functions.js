// removes the spellcheck DOM element
function removeSpellCheckElement() {
    const spellcheckContainer = getSpellCheckElement();
    if (spellcheckContainer !== null) {
        spellcheckContainer.parentElement.removeChild(spellcheckContainer);
    }
}

// returns the spellcheck DOM element
function getSpellCheckElement() {
    return document.getElementById('spellcheck');
}

// returns the spellcheck textarea element
function getSpellCheckTextElement() {
    return document.getElementById('spellcheck-text');
}

// Adds a spellcheck element to the DOM
function createSpellCheckElement() {
    const pdfdoc = document.querySelector("div.full-size.pdf");
    if (getSpellCheckElement() === null) {
        pdfdoc.append(makeNewSpellcheckElement());
    }
}

// Filter the text. Commandos should be removed so Grammarly can understand the text.
// The number of lines should not be affected. This will cause the plugin not to work.
function filter(text) {
    const regexes = [
        {pattern: /w*(?<!\\)%.*\n?/g, newValue: '\n'},
        {pattern: '\\%', newValue: '%'},
        {pattern: '\\_', newValue: '_'},
        {pattern: /(\\section{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\subsection{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\title{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\textit{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\date{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\author{)(.*?)(})/g, newValue: '$2'},
        {pattern: /(\\usepackage{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\documentclass{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\begin{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\end{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\keywords{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\cite{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\citep{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\citeal\[]{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\citealp\[]{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\bibliographystyle{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\bibliography{)(.*?)(})/g, newValue: ''},
        {pattern: /(\\numberofauthors{)(.*?)(})/g, newValue: ''}
    ]

    for (let i = 0; i < regexes.length; i++) {
        const newText = text.replaceAll(regexes[i].pattern, regexes[i].newValue);
        if (newText.split("\n").length === text.split("\n").length) {
            text = newText
        } else {
            console.log('pattern incorrect. text length reduced. :' + regexes[i].pattern)
        }
    }
    return text

}

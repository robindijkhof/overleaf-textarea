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
    return text
    // .replaceAll(/w*(?<!\\)%.*\n?/g, '\n')
    // .replaceAll('\\%', '%')
    // .replaceAll('\\_', '_')
    // .replaceAll(/(\\section{)(.*?)(})/g, "$2")
    // .replaceAll(/(\\subsection{)(.*?)(})/g, "$2")
    // .replaceAll(/(\\title{)(.*?)(})/g, "$2")
    // .replaceAll(/(\\textit{)(.*?)(})/g, "$2")
    // .replaceAll(/(\\documentclass{)(.*?)(})/g, '')
    // .replaceAll(/(\\begin{)(.*?)(})/g, '')
    // .replaceAll(/(\\end{)(.*?)(})/g, '')
    // .replaceAll(/(\\keywords{)(.*?)(})/g, '')
    // .replaceAll(/(\\cite{)(.*?)(})/g, '')
    // .replaceAll(/(\\citep{)(.*?)(})/g, '')
    // .replaceAll(/(\\citeal\[]{)(.*?)(})/g, '')
    // .replaceAll(/(\\citealp\[]{)(.*?)(})/g, '')
    // .replaceAll(/(\\bibliographystyle{)(.*?)(})/g, '')
    // .replaceAll(/(\\bibliography{)(.*?)(})/g, '')
    // .replaceAll(/(\\numberofauthors{)(.*?)(})/g, '')
    // .replaceAll(/\\maketitle.*\n?/g, '')
}

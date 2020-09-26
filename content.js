'use strict';

setInterval(() => {
    chrome.storage.sync.get(['active'], function (result) {
        let spellcheckContainer = document.getElementById('spellcheck');
        if (result.active) {
            var text = filter(getText());

            const pdfdoc = document.querySelector("div.full-size.pdf");
            if (spellcheckContainer === null) {
                pdfdoc.append(getSpellcheckElement());
            }

            const spellcheck = document.getElementById('spellcheck-text');
            if (spellcheck !== null) {
                const current = document.activeElement;
                if (spellcheck.value !== text) {
                    const scrollTop = spellcheck.scrollTop;
                    spellcheck.value = text;
                    spellcheck.focus();
                    current.focus();
                    spellcheck.scrollTop = scrollTop;
                }
            }
        } else {
            if (spellcheckContainer !== null) {
                spellcheckContainer.parentElement.removeChild(spellcheckContainer);
            }
        }
    });
}, 2000);


function getSpellcheckElement() {
    const element = document.createElement('div');
    element.id = 'spellcheck';
    element.style.position = 'absolute';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.backgroundColor = 'Red';

    // const overlay = document.createElement('div');
    // overlay.id = 'overlay';
    // overlay.style.position = 'absolute';
    // overlay.style.width = '100%';
    // overlay.style.height = '100%';
    // element.append(overlay);

    const textarea = document.createElement('textarea');
    textarea.id = 'spellcheck-text';
    textarea.style.width = '100%';
    textarea.style.height = '90%';
    textarea.style.overflow = 'hidden';
    element.append(textarea);


    return element;
}

function getText() {
    var text = '';
    const textdocument = document.querySelector('div.ace_layer.ace_text-layer');
    if (textdocument !== null) {
        const paragraphs = textdocument.childNodes;
        for (var i = 0; i < paragraphs.length; i++) {
            const lines = paragraphs[i].childNodes;
            for (var j = 0; j < lines.length; j++) {
                text += lines[j].textContent;
            }
            text += '\n';
        }
    }

    return text;
}

function filter(text) {
    return text
        .replaceAll(/w*(?<!\\)%.*\n?/g, '\n')
        .replaceAll('\\%', '%')
        .replaceAll('\\_', '_')
        .replaceAll(/(\\section{)(.*?)(})/g, "$2")
        .replaceAll(/(\\subsection{)(.*?)(})/g, "$2")
        .replaceAll(/(\\title{)(.*?)(})/g, "$2")
        .replaceAll(/(\\textit{)(.*?)(})/g, "$2")
        .replaceAll(/(\\documentclass{)(.*?)(})/g, '')
        .replaceAll(/(\\begin{)(.*?)(})/g, '')
        .replaceAll(/(\\end{)(.*?)(})/g, '')
        .replaceAll(/(\\keywords{)(.*?)(})/g, '')
        .replaceAll(/(\\cite{)(.*?)(})/g, '')
        .replaceAll(/(\\bibliographystyle{)(.*?)(})/g, '')
        .replaceAll(/(\\bibliography{)(.*?)(})/g, '')
        .replaceAll(/(\\numberofauthors{)(.*?)(})/g, '')
        .replaceAll(/\\maketitle.*\n?/g, '')
}

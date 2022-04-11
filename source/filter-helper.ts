// Filter the text. Commandos should be removed so Grammarly can understand the text.
// The number of lines should not be affected. This will cause the plugin not to work.
import {Filter} from "./Popup/filter";
import {log} from "./log-helper";

const defaultFilters: Filter[] = [
  {pattern: /w*(?<!\\)%.*(\n?)/g, newValue: '$1'},
  {pattern: '\\\\', newValue: ''},
  {pattern: '  ', newValue: ' '},
  {pattern: '\\%', newValue: '%'},
  {pattern: '\\$', newValue: '$'},
  {pattern: '\\&', newValue: '&'},
  {pattern: '\\#', newValue: '#'},
  {pattern: '\\_', newValue: '_'},
  {pattern: '\\texteuro', newValue: '€'},
  {pattern: /(\\author{)(.*?)(})/g, newValue: '$2'},
  {pattern: /(\\begin{)(.*?)(})(\[.*?])?/g, newValue: ''},
  {pattern: /(\\bibliography{)(.*?)(})/g, newValue: ''},
  {pattern: /(\\bibliographystyle{)(.*?)(})/g, newValue: ''},
  {pattern: /(\\caption{)(.*?)(})/g, newValue: '$2'},
  {pattern: '\\centering', newValue: ''},
  {pattern: /( \\cite(p|al\[]|alp\[])?{)(.*?)}([ .,])/g, newValue: '$4'},
  {pattern: /\\cite(p|al\[]|alp\[])?{(.*?)}/g, newValue: ''},
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
  {pattern: '\\par', newValue: ''},
  {pattern: '\\protect', newValue: ''},
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
  {pattern: /(\\ac[slf]{0,1}[p]?{)(.*?)(})/g, newValue: '$2'},
  {pattern: /(\\todo{)(.*?)(})/g, newValue: ''},
  {pattern: /(\\url{)(.*?)(})/g. newValue: ''},
  {pattern: /{\\footnote{)(.*?)(})/g, newValue: '$2'},
  {pattern: '\\item', newValue: '-'}
];

export function filter(text: string, userFilters: Filter[]): string {
  let filters = userFilters.concat(defaultFilters);

  //Dedupe. Keep the first specified by the user.
  filters = uniqByKeepFirst(filters, (x: Filter) => String(x.pattern));

  for (let i = 0; i < filters.length; i++) {
    if (filters[i].newValue === '%%EMPTY%%') {
      continue;
    }

    const regex = getRegFromString(filters[i].pattern);
    let newText = '';
    if (typeof regex === 'string') {
      newText = text.replaceAll(regex, filters[i].newValue);
    } else {
      newText = text.replace(regex, filters[i].newValue);
    }

    if (newText.split("\n").length === text.split("\n").length) {
      text = newText
    } else {
      let patternString = filters[i].pattern;
      if (typeof patternString !== 'string') {
        patternString = String(patternString);
      }

      let newValueString = filters[i].newValue;


      // Note, logs are reversed.
      log('If you don\'t know what to do, add the following filter: ' + patternString + ' with value: %%EMPTY%%');
      log('If this is custom filter, remove or update it. If it is not a custom filter, try to fix it by overriding it.');
      log('Pattern incorrect. Text length reduced by :' + patternString + ', ' + newValueString);
    }

  }
  return text;

}

// Creates a regex from the provided string. If fails, return the original string or original regex.
function getRegFromString(string: string | RegExp): string | RegExp {
  if (typeof string === "object") {
    return string;
  }

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
function uniqByKeepFirst<T>(a: T[], key: (x: T) => string): T[] {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

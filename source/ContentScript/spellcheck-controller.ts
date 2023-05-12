import {getPluginElement, getSpellCheckTextElement} from "../dom-helper";
import {filter} from "../filter-helper";
import {log} from "../log-helper";
import DiffMatchPatch from 'diff-match-patch';
import {Filter} from "../Popup/filter";


export class SpellcheckController {
  private static instance: SpellcheckController;

  //Fallback method for merging changes back to the editor
  private justDidFallback = false;
  // @ts-ignore
  private isFireFox = typeof InstallTrigger !== 'undefined';

  // the last textvalue emitted
  private lastText: string;
  // the last textvalue emitted that has been filtered
  private lastFilteredText: string;

  private dmp = new DiffMatchPatch.diff_match_patch()


  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): SpellcheckController {
    if (!SpellcheckController.instance) {
      SpellcheckController.instance = new SpellcheckController();
    }

    return SpellcheckController.instance;
  }

  public textAreaInputChangeEvent(): void {
    const textarea = getSpellCheckTextElement();
    const newText = textarea!.value;
    const temp = {a: this.lastFilteredText};
    const obj = JSON.stringify(temp);
    const oldText = JSON.parse(obj).a;

    if (newText === oldText) {
      return;
    }

    const newLines = newText.split('\n');
    const oldLines = oldText.split('\n');
    if (newLines.length !== oldLines.length) {
      log('Nummer of lines is not equal. Cound not apply the fix');
    } else {
      for (let i = 0; i < newLines.length; i++) {
        const newLine = newLines[i];
        const oldLine = oldLines[i];

        if (newLine !== oldLine) {
          const patches = this.dmp.patch_make(oldLine, newLine);

          const fixed = this.dmp.patch_apply(patches, this.lastText.split('\n')[i])[0];
          const message = JSON.stringify({method: 'replaceLine', args: {lineNumber: i + 1, newValue: fixed}});
          document.dispatchEvent(new CustomEvent('call_command',
            {detail: message}
          ));
        }
      }
    }
  }

  public handleOverleafReturnCommand(message: any, userFilters: Filter[]): void {
    // Currently the only value we are expecting is the editor value
    if (message.method === 'getValue') {

      // This is used as a fallbackmethod for FireFox. The input event is not triggerd by Grammarly.
      if (
        this.isFireFox &&
        this.lastFilteredText !== undefined &&
        !this.justDidFallback &&
        JSON.stringify({a: this.lastFilteredText}) !== JSON.stringify({a: getSpellCheckTextElement()?.value})
      ) {
        this.textAreaInputChangeEvent()
        this.justDidFallback = true;
      } else {
        this.justDidFallback = false;


        let spellcheckContainer = getPluginElement();
        if (spellcheckContainer !== null) {
          const text = message.value;

          const filteredText = filter(text, userFilters);

          // Setting the last texts to we can access them later.
          this.lastText = text;
          this.lastFilteredText = filteredText;


          // Update the textarea if present and text has changed.
          const spellcheck = getSpellCheckTextElement()
          if (spellcheck !== null) {
            // const current = document.activeElement;
            if (spellcheck.value !== filteredText) {
              const scrollTop = spellcheck.scrollTop;
              spellcheck.value = filteredText;
              // spellcheck.value = filteredText;

              // if (firstTimeFocus) {
              //   spellcheck.focus();
              //   current.focus();
              //   firstTimeFocus = false;
              // }
              spellcheck.scrollTop = scrollTop;
            }
          }
        }
      }
    }
  }
}

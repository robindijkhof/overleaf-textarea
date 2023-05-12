// Bijhouden van laatst geopende document

// let lastDoc: string;

// import { _ide } from "../typings";


import { getOverleafEditorHasFocus, getOverleafScrollElement, getTextAreaHasFocus } from "../dom-helper";

let mouseX = 0;
let mouseY = 0;

document.addEventListener("call_command", event => {
  // @ts-ignore
  const message = JSON.parse(event.detail);

  let result;

  try {
    //Handle specific methods.
    if (message.method === "replaceLine") {
      const row = message.args.lineNumber;
      const newText = message.args.newValue;

      // @ts-ignore
      const view = _ide.editorManager.$scope.editor.sharejs_doc.cm6.view;
      const state = view.state;
      const lineStart = state.doc.line(row).from;
      const lineEnd = state.doc.line(row).to;

      const tr = state.update({
        changes: { from: lineStart, to: lineEnd, insert: newText }
      });

      view.dispatch(tr);

    } else if (message.method === "getValue") {
      result =
        {
          detail:
            JSON.stringify({
              method: message.method,
              // @ts-ignore
              value: _ide.editorManager.$scope.editor.sharejs_doc.cm6.shareDoc.getText()
            })
        };
    }

  } catch (e) {
    //Not sure why some error is thrown
  }

  // Return a result event
  if (result !== null && result !== undefined) {
    document.dispatchEvent(new CustomEvent("return_command", result));
  }
});


setOverleafScrollEventListener();


//Sync textarea scroll
document.addEventListener("textarea_scroll", event => {
  if (getOverleafEditorHasFocus(mouseX, mouseY)) {
    return;
  }

  // @ts-ignore
  const percentage = event.detail;

  //@ts-ignore
  const scrollOffset = percentage * (getOverleafScrollElement().scrollHeight - getOverleafScrollElement().clientHeight);

  // @ts-ignore
  getOverleafScrollElement().scrollTop = scrollOffset;
});

document.addEventListener("mousemove", function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function setOverleafScrollEventListener() {
  setTimeout(() => {
    const scrollElement = getOverleafScrollElement();

    if (!scrollElement) {
      setOverleafScrollEventListener();
      return;
    }

    scrollElement.addEventListener("scroll", function() {
      if(getTextAreaHasFocus(mouseX, mouseY)){
        return;
      }

      const scrollPercentage = scrollElement.scrollTop / (scrollElement.scrollHeight - scrollElement.clientHeight);

      if (scrollElement.scrollTop != 0) { // Sometimes this value is incorrectly 0. In this case we don't want to send a scoll event.
        document.dispatchEvent(new CustomEvent("overleaf_scroll", { detail: scrollPercentage }));
      }
    });
  }, 100);
}

export {};

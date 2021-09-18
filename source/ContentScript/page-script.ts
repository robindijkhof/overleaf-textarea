// Bijhouden van laatst geopende document

let lastDoc: string;

document.addEventListener('call_command',  event => {
  // @ts-ignore
  const message = JSON.parse(event.detail);

  let result;

  try {
    //Handle specific methods.
    if (message.method === 'replaceLine') {
      const row = message.args.lineNumber;
      const newText = message.args.newValue;

      _ide.editorManager.$scope.editor.sharejs_doc.ace.session.replace(new ace.Range(row, 0, row, Number.MAX_VALUE), newText)
    }
    // Handle non specific methods by passing them by to the editor session.
    else {
      result =
        {
          detail:
            JSON.stringify({
              method: message.method,
              // @ts-ignore
              value: _ide.editorManager.$scope.editor.sharejs_doc.ace.session[message.method]
                .apply(_ide.editorManager.$scope.editor.sharejs_doc.ace.session, [message.args])
            })
        }
    }
  } catch (e) {
    //Not sure why some error is thrown
  }

  // Return a result event
  if (result !== null && result !== undefined) {
    document.dispatchEvent(new CustomEvent('return_command', result));
  }
});

// Send overleaf scroll. Selecting a new file will remove the listener. To work arround that problem, check every 2 seconds if the file is still open.
setInterval(() => {
  if(_ide && lastDoc !== _ide.editorManager.$scope.editor.sharejs_doc.doc_id){
    lastDoc = _ide.editorManager.$scope.editor.sharejs_doc.doc_id;

    _ide.editorManager.$scope.editor.sharejs_doc.ace.session.on("changeScrollTop",  scrollTop => {
      let calc = _ide.editorManager.$scope.editor.sharejs_doc.ace.session.getScreenLength() * _ide.editorManager.$scope.editor.sharejs_doc.ace.renderer.lineHeight
      let percentage2 = scrollTop / calc * 100;


      document.dispatchEvent(new CustomEvent('overleaf_scroll', {detail: percentage2}));
    });
  }
}, 2000)



// Sync textarea scroll
document.addEventListener('textarea_scroll',  event => {
  // @ts-ignore
  const percentage = event.detail;
  const calc = _ide.editorManager.$scope.editor.sharejs_doc.ace.session.getScreenLength() * _ide.editorManager.$scope.editor.sharejs_doc.ace.renderer.lineHeight


  const scrollTop = calc * percentage / 100;

  _ide.editorManager.$scope.editor.sharejs_doc.ace.session.setScrollTop(scrollTop);
});

export {}

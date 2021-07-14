document.addEventListener('call_command', function (e) {
  const message = JSON.parse(e.detail);

  let result;

  try {
    //Handle specific methods.
    if (message.method === 'replaceLine') {
      var row = message.args.lineNumber;
      var newText = message.args.newValue;

      _ide.editorManager.$scope.editor.sharejs_doc.ace.session.replace(new ace.Range(row, 0, row, Number.MAX_VALUE), newText)
    }
    // Handle non specific methods by passing them by to the editor session.
    else {
      result =
        {
          detail:
            JSON.stringify({
              method: message.method,
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

// Send overleaf scroll
setTimeout(() => {
  if(_ide){
    _ide.editorManager.$scope.editor.sharejs_doc.ace.session.on("changeScrollTop", function (scrollTop) {
      let maxHeihgt = _ide.editorManager.$scope.editor.sharejs_doc.ace.renderer.layerConfig.maxHeight;
      let calc = _ide.editorManager.$scope.editor.sharejs_doc.ace.session.getScreenLength() * _ide.editorManager.$scope.editor.sharejs_doc.ace.renderer.lineHeight
      let percentage = scrollTop / maxHeihgt * 100;
      let percentage2 = scrollTop / calc * 100;

      document.dispatchEvent(new CustomEvent('overleaf_scroll', {detail: percentage2}));
    });
  }
}, 2000)

// Sync textarea scroll
document.addEventListener('textarea_scroll', function (e) {
  const percentage = e.detail;
  const maxHeihgt = _ide.editorManager.$scope.editor.sharejs_doc.ace.renderer.layerConfig.maxHeight;
  const calc = _ide.editorManager.$scope.editor.sharejs_doc.ace.session.getScreenLength() * _ide.editorManager.$scope.editor.sharejs_doc.ace.renderer.lineHeight

  const scrollTop = calc * percentage / 100;
  _ide.editorManager.$scope.editor.sharejs_doc.ace.session.setScrollTop(scrollTop);
});







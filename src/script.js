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
    if(result !== null && result !== undefined){
        document.dispatchEvent(new CustomEvent('return_command', result));
    }
});






document.addEventListener('call_command', function (e) {

    let result;

    try {
        //Handle specific methods.
        if (e.detail.method === 'replaceLine') {
            var row = e.detail.args.lineNumber;
            var newText = e.detail.args.newValue[0];

            _ide.editorManager.$scope.editor.sharejs_doc.ace.session.replace(new ace.Range(row, 0, row, Number.MAX_VALUE), newText)
        }
        // Handle non specific methods by passing them by to the editor session.
        else {
            result =
                {
                    detail:
                        {
                            method: e.detail.method,
                            value: _ide.editorManager.$scope.editor.sharejs_doc.ace.session[e.detail.method]
                                .apply(_ide.editorManager.$scope.editor.sharejs_doc.ace.session, [e.detail.args])
                        }
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






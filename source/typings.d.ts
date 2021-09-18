declare var _ide: {
  editorManager: {
    $scope: {
      editor: {
        sharejs_doc: {
          ace: {
            session: AceAjax.IEditSession,
            renderer: AceAjax.VirtualRenderer
          },
          doc_id: string
        }
      }
    }
  }
};

declare var ace: any;


import { Doc } from "codemirror";

declare var _ide: {
  editorManager: {
    $scope: {
      editor: {
        sharejs_doc: {
          // ace: {
          //   session: AceAjax.IEditSession,
          //   renderer: AceAjax.VirtualRenderer
          // },
          // doc_id: string
          cm6: {
            view: {
              state: {
                doc: any
                update(param: any);
              }
              dispatch(tr: any);
            }
          }
        }
      }
    }
  }
};

declare var ace: any;

module.exports = {
  _ide
}



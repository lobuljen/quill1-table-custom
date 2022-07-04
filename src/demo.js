import Quill from 'quill';
import TableModule from './index.js';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import './css/quill.table.css';

// import '@fortawesome/fontawesome-free/webfonts';
// import '@fortawesome/fontawesome-free/css/solid.css';
// import "./css/fa.scss";

Quill.register('modules/table', TableModule);

const defaultToolbar = [
  [
    {
      table: TableModule.tableOptions()
    },
    {
      table: [
        'insert',
        'append-row-above',
        'append-row-below',
        'append-col-before',
        'append-col-after',
        'remove-col',
        'remove-row',
        'remove-table',
        'split-cell',
        'merge-selection',
        'remove-cell',
        'remove-selection',
        'undo',
        'redo'
      ]
    }
  ],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block', 'image'],

  [{ list: 'ordered' }, { list: 'bullet' }],

  [{ indent: '-1' }, { indent: '+1' }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],

  ['clean']
];

const quill = new Quill(document.getElementById('quillContainer'), {
  modules: {
    toolbar: defaultToolbar,
    table: true,
    history: {
      delay: 500
    },
    keyboard: {
      // Since Quill’s default handlers are added at initialization, the only way to prevent them is to add yours in the configuration.
      bindings: {
        backspace: {
          key: 'backspace',
          handler: function (range, keycontext) {
            return TableModule.keyboardHandler(this.quill, 'backspace', range, keycontext);
          }
        },
        delete: {
          key: 'delete',
          handler: function (range, keycontext) {
            return TableModule.keyboardHandler(this.quill, 'delete', range, keycontext);
          }
        },
        undo: {
          ctrlKey: true,
          key: 'z',
          handler: function (range, keycontext) {
            return TableModule.keyboardHandler(this.quill, 'undo', range, keycontext);
          }
        },
        redo: {
          ctrlKey: true,
          shiftKey: true,
          key: 'z',
          handler: function (range, keycontext) {
            return TableModule.keyboardHandler(this.quill, 'redo', range, keycontext);
          }
        },
        copy: {
          ctrlKey: true,
          key: 'c',
          handler: function (range, keycontext) {
            return TableModule.keyboardHandler(this.quill, 'copy', range, keycontext);
          }
        }
      }
    }
  },
  theme: 'snow'
});

quill.on('text-change', function(delta, oldDelta, source) {
  console.log(delta, oldDelta, source);
});

window.quill = quill;

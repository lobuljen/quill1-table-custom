import Quill from 'quill';
import Delta from 'quill-delta';
import TableCell from './js/TableCellBlot';
import TableRow from './js/TableRowBlot';
import TableHistory from './js/TableHistory';
import Table from './js/TableBlot';
import Contain from './js/ContainBlot';
import './css/quill.table.css';
import TableTrick from "./js/TableTrick";

let Container = Quill.import('blots/container');

const Parchment = Quill.import('parchment');

const nodeListToArray = collection => {
    const elementsIndex = [];
    for (let i = 0; i < collection.length; i++) {
        elementsIndex.push(i);
    }
    return elementsIndex.map(i => collection.item(i));
};

Container.order = [
    'list', 'contain',   // Must be lower
    'td', 'tr', 'table'  // Must be higher
];

export default class TableModule {

    static register() {
        Quill.register(TableCell);
        Quill.register(TableRow);
        Quill.register(Table);
        Quill.register(Contain);
    }

    constructor(quill, options) {
        window.quill = window.quill || quill;
        quill.history.tableStack = {};

        let toolbar = quill.getModule('toolbar');
        toolbar.addHandler('table', function (value) {
            return TableTrick.table_handler(value, quill);
        });
        let clipboard = quill.getModule('clipboard');
        clipboard.addMatcher('TABLE', function (node, delta) {
            return delta;
        });
        clipboard.addMatcher('TR', function (node, delta) {
            return delta;
        });
        clipboard.addMatcher('TD', function (node, delta) {
            return delta.compose(new Delta().retain(delta.length(), {
                td: node.getAttribute('table_id') + '|' + node.getAttribute('row_id') + '|' + node.getAttribute('cell_id')
            }));
        });
    }

    static tableOptions() {
        const maxRows = 5;
        const maxCols = 5;
        const tableOptions = [];
        for (let r = 1; r <= maxRows; r++) {
            for (let c = 1; c <= maxCols; c++) {
                tableOptions.push("newtable_" + r + "_" + c);
            }
        }
        return tableOptions;
    }

    static removeNodeChildren(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    };

    static keyboardHandler(key, range, keycontext) {
        const quill = window.quill;
        let format_start = quill.getFormat(range.index - 1);
        let format_end = quill.getFormat(range.index + range.length);

        if (key === "undo" || key === "redo") {
          return TableTrick.table_handler(key, quill);
        }

        // If the event is not in a cell, then pass the standard handler
        if (!format_start.td && !keycontext.format.td && !format_end.td) {
            return true;
        }

        if (key === "backspace") {
            // if the selection is at the cell border
            if (!keycontext.offset && !range.length) {
                const selection = window.getSelection();
                const nodeList = document.querySelectorAll(".ql-editor p");
                // remove selected content
                const resultNodes = nodeListToArray(nodeList).filter(cell =>
                    selection.containsNode(cell, true)
                );

                // deletion does not affect the cell
                if (!resultNodes.length) return true;

                resultNodes.forEach((resultNode, i) => {
                    let node = resultNode.parentNode;
                    let nextNode = node.nextSibling;
                    if (node.nodeName === 'TD') {
                        let parentNode = node.parentNode;
                        node.remove();
                        if (parentNode.nodeName === 'TR' && !parentNode.childNodes.length) {
                            node = parentNode;
                            nextNode = node.nextSibling;
                            parentNode = node.parentNode;
                            node.remove();
                            if (parentNode.nodeName === 'TABLE' && !parentNode.childNodes.length) {
                                node = parentNode;
                                nextNode = node.nextSibling;
                                parentNode = node.parentNode;
                                node.remove();
                            }
                        }

                        TableHistory.register('remove', node, nextNode, parentNode);
                        TableHistory.add(quill);
                    }
                });

                return false;
            }

            // If we delete not at the cell border, then pass the standard handler
            return true;
        }

        let node = quill.selection.getNativeRange().start.node;
        if (!node) return false
        let blot = Parchment.find(node);

        if (
            key === "delete" && blot &&
            keycontext.offset < (blot.text ? blot.text.length : 0)
        ) {
            return true;
        }

        const [prev] = quill.getLine(range.index - 1);
        const [next] = quill.getLine(range.index + 1);
        // If a cell has multiple rows, you can delete as standard
        if (key === "backspace" && prev && prev.next) {
            return true;
        }
        if (key === "delete" && next && next.prev) {
            return true;
        }
    };
}

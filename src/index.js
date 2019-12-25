import Quill from 'quill';
import Delta from 'quill-delta';
import TableCell from './js/TableCellBlot';
import TableRow from './js/TableRowBlot';
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

        // quill.keyboard.addBinding({
        //     key: 8
        // }, (range, keycontext) => {
        //     alert(213);
        //     this.keyboardHandler(8, range, keycontext)
        // });
        //
        // quill.keyboard.addBinding({
        //     key: "delete"
        // }, (range, keycontext) => {
        //     this.keyboardHandler("delete", range, keycontext)
        // });
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
        // если событие не в ячейки, то передать стандартному обработчику
        if (!format_start.td && !keycontext.format.td && !format_end.td) {
            return true;
        }
        // если выделение у границы ячейки
        if (range.length > 0) {
            const selection = window.getSelection();
            const nodeList = document.querySelectorAll(".ql-editor p");
            // удалить выделенное содержимое
            const resultNodes = nodeListToArray(nodeList).filter(cell =>
                selection.containsNode(cell, true)
            );
            // удаление не затрагивает ячейку
            if (resultNodes.length <= 1) return true;
            const range = selection.getRangeAt(0);
            let offset = 0;
            resultNodes.forEach((node, i) => {
                let tempRange = document.createRange();
                tempRange.selectNodeContents(node);
                tempRange.setEnd(range.startContainer, range.startOffset);
                let before = tempRange.toString();
                tempRange.selectNodeContents(node);
                tempRange.setStart(range.endContainer, range.endOffset);
                let after = tempRange.toString();
                TableModule.removeNodeChildren(node);
                if (i === 0 && keycontext.offset > 0) {
                    if (before.length > 0) {
                        offset = before.length;
                        let newtext = document.createTextNode(before);
                        node.appendChild(newtext);
                    } else {
                        node.remove();
                    }
                } else if (i === resultNodes.length - 1) {
                    if (after.length > 0) {
                        let newtext = document.createTextNode(after);
                        node.appendChild(newtext);
                    } else {
                        node.remove();
                    }
                } else {
                    node.remove();
                }
            });
            // убрать выделение
            if (resultNodes[0].firstChild) {
                window.getSelection().collapse(resultNodes[0].firstChild, offset);
            } else {
                window.getSelection().collapse(resultNodes[0], 0);
            }
            return false;
        }
        // если удаляем не у границы ячейки, то передать стандартному обработчику
        if (key === "backspace" && keycontext.offset > 0) {
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
        // если в ячейки несколько строк, то можно удалять стандартно
        if (key === "backspace" && prev && prev.next) {
            return true;
        }
        if (key === "delete" && next && next.prev) {
            return true;
        }
    };
}

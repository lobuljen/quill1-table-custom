window.Quill = require("quill");
const quillTable = require("./index.js");

Quill.register(quillTable.TableCell);
Quill.register(quillTable.TableRow);
Quill.register(quillTable.Table);
Quill.register(quillTable.Contain);
Quill.register("modules/table", quillTable.TableModule);

import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "./css/quill.table.css";

const maxRows = 10;
const maxCols = 5;
const tableOptions = [];
for (let r = 1; r <= maxRows; r++) {
    for (let c = 1; c <= maxCols; c++) {
        tableOptions.push("newtable_" + r + "_" + c);
    }
}

const defaultToolbar = [
    [
        {
            table: [
                "newtable_1_2",
                "newtable_1_3",
                "newtable_1_4",
                "newtable_2_2",
                "newtable_2_3",
                "newtable_3_3",
                "remove-table"
            ]
        },
        {
            table: ["append-row", "append-col", "remove-col", "remove-row"]
        }
    ],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block", "image"],

    [{ list: "ordered" }, { list: "bullet" }],

    [{ indent: "-1" }, { indent: "+1" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],

    ["clean"]
];

const nodeListToArray = collection => {
    const elementsIndex = [];
    for (let i = 0; i < collection.length; i++) {
        elementsIndex.push(i);
    }
    return elementsIndex.map(i => collection.item(i));
};

const removeNodeChildren = node => {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

const keyboardHandler = (key, range, keycontext) => {
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
        const alltext = selection.toString();
        const cells = document.querySelectorAll(".ql-editor td");
        // удалить содержимое тех ячеек, которые выделены
        const resultCells = nodeListToArray(cells).filter(cell =>
            selection.containsNode(cell, true)
        );
        // удаление не затрагивает ячейку
        if (resultCells.length <= 1) return true;
        if (!format_end.td) {
            const divs = document.querySelectorAll(".ql-editor div");
            const resultDivs = nodeListToArray(divs).filter(div =>
                selection.containsNode(div, true)
            );
            resultDivs.forEach((div, i) => {
                const text = div.textContent;
                console.log(text, "*");
                removeNodeChildren(div);
            });
        }
        resultCells.forEach((cell, i) => {
            const text = cell.textContent;
            removeNodeChildren(cell);
            if (i === 0 && keycontext.offset > 0) {
                // debugger;
                let newtext = document.createTextNode(
                    text.substr(0, keycontext.offset)
                );
                cell.appendChild(newtext);
            }
            if (i === resultCells.length - 1) {
                const arr = alltext.split("\n");
                let newtext = document.createTextNode(
                    text.substr(arr[arr.length - 1].length)
                );
                cell.appendChild(newtext);
            }
        });
        // убрать выделение
        if (resultCells[0].firstChild) {
            window
                .getSelection()
                .collapse(resultCells[0].firstChild, keycontext.offset);
        } else {
            window.getSelection().collapse(resultCells[0], 0);
        }
        return false;
    }
    // если удаляем не у границы ячейки, то передать стандартному обработчику
    if (key === "backspace" && keycontext.offset > 0) {
        return true;
    }
    let node = quill.selection.getNativeRange().start.node;
    let blot = Parchment.find(node);

    if (
        key === "delete" &&
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

const quill = new Quill(document.getElementById("quillContainer"), {
    modules: {
        toolbar: defaultToolbar,
        table: true,
        keyboard: {
            bindings: {
                backspace: {
                    key: "backspace",
                    handler: (range, keycontext) =>
                        keyboardHandler("backspace", range, keycontext)
                },
                delete: {
                    key: "delete",
                    handler: (range, keycontext) =>
                        keyboardHandler("delete", range, keycontext)
                }
            }
        }
    },
    theme: "snow"
});

window.quill = quill
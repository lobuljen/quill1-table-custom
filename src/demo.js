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

function tableController(range, keycontext) {
    let format = quill.getFormat(range.index - 1);
    // если событие не в ячейки, то передать стандартному обработчику
    if (!format.td && !keycontext.format.td) {
        return true;
    }
    // если выделение у границы ячейки
    if (range.length > 0) {
        const selection = window.getSelection();
        const alltext = selection.toString()
        const cells = document.getElementsByTagName("td");
        // удалить содержимое тех ячеек, которые выделены
        const resultCells = [...Array(cells.length).keys()]
            .map(i => cells.item(i))
            .filter(cell =>
                selection.containsNode(cell, true)
            );
        // удаление не затрагивает ячейку
        if (resultCells.length <= 1) return true
        resultCells.forEach((cell, i) => {
            const text = cell.textContent;
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
            if (i === 0 && keycontext.offset > 0) {
                let newtext = document.createTextNode(text.substr(0, keycontext.offset))
                cell.appendChild(newtext)
            }
            if (i === resultCells.length - 1) {
                const arr = alltext.split("\n")
                let newtext = document.createTextNode(text.substr(arr[arr.length - 1].length))
                cell.appendChild(newtext)
            }
        });
        // убрать выделение
        if (resultCells[0].firstChild) {
            window.getSelection().collapse(resultCells[0].firstChild, keycontext.offset);
        } else {
            window.getSelection().collapse(resultCells[0], 0);
        }
        return false;
    }
    // если удаляем не у границы ячейки, то передать стандартному обработчику
    if (keycontext.offset > 0) {
        return true;
    }
    const [prev] = quill.getLine(range.index - 1);
    // если в ячейки несколько строк, то можно удалять стандартно
    if (prev && prev.next) {
        return true;
    }
}

const quill = new Quill(document.getElementById("quillContainer"), {
    modules: {
        toolbar: defaultToolbar,
        table: true,
        keyboard: {
            bindings: {
                backspace: {
                    key: "backspace",
                    handler: (range, keycontext) => tableController(range, keycontext)
                },
                delete: {
                    key: "delete",
                    handler: (range, keycontext) => tableController(range, keycontext)
                },
            }
        }
    },
    theme: "snow"
});

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

const quill = new Quill(document.getElementById("quillContainer"), {
    modules: {
        toolbar: defaultToolbar,
        table: true,
        keyboard: {
            bindings: {
                td: {
                    key: "backspace",
                    handler: function(range, keycontext) {
                        let format = quill.getFormat(range.index - 1);
                        // если событие не в ячейки, то передать стандартному обработчику
                        if (!format.td && !keycontext.format.td) {
                            return true;
                        }
                        // если выделение у границы ячейки
                        if (range.length > 0) {
                            const selection = window.getSelection();
                            // снять выделение
                            // quill.setSelection(range.index, null);
                            const cells = document.getElementsByTagName("td");
                            // удалить содержимое тех ячеек, которые выделены
                            const resultCells = [...Array(cells.length).keys()]
                                .map(i => cells.item(i))
                                .filter(cell =>
                                    selection.containsNode(cell, true)
                                );
                            // удаление не затрагивает ячейку
                            if (resultCells.length === 1) return true
                            resultCells.forEach(cell => {
                                const result = selection.containsNode(
                                    cell,
                                    true
                                );
                                if (result) {
                                    while (cell.firstChild) {
                                        cell.removeChild(cell.firstChild);
                                    }
                                }
                            });
                            // убрать выделение
                            window.getSelection().collapse(resultCells[0], 0);
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
                }
            }
        }
    },
    theme: "snow"
});

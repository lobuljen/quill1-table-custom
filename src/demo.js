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
// const KeyBoard = quill.getModule("keyboard");
// console.log(quill.keyboard)
// quill.keyboard.addBinding({ key: "Backspace" }, {}, function(range, context) {
//     console.log("<---")
// if (range.index === 0 || this.quill.getLength() <= 1) return true;
// const [line] = this.quill.getLine(range.index);
// if (context.offset === 0) {
//     const [prev] = this.quill.getLine(range.index - 1);
//     if (prev != null) {
//         if (
//             prev.statics.blotName === "table-cell-line" &&
//             line.statics.blotName !== "table-cell-line"
//         )
//             return false;
//     }
// }
//     return true;
// });
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
                        const [line] = quill.getLine(range.index);
                        const [next] = quill.getLine(
                            range.index + range.length
                        );
                        console.log(line.domNode);
                        if (range.length > 0) {
                            if (keycontext.offset === 0) {
                                console.log("delete all")
                            }
                            // alert(s)
                            // console.log(s)
                            // const selRange = selected.getRangeAt(0);
                            // selRange.deleteContents()

                            // console.log(keycontext.offset, "**")
                            // if (keycontext.offset === 0) {
                            //     line.domNode.parent.textContent = ""
                            // }
                            // let text = quill.getText(range.index, range.length);
                            // console.log(range.index)
                            // console.log(quill.getLeaf(range.index))
                            // console.log(quill.getLeaf(range.index+1))
                            // console.log(quill.getLeaf(range.index+2))
                            // console.log(quill.getLeaf(range.index+3))
                            // if (line.domNode.textContent.length > 0) {
                            //     if (text !== line.domNode.textContent) return true
                            //     line.domNode.textContent = ""
                            // }
                            // if (range.length === line.domNode.textContent.length) {
                            //     return true
                            // }
                            // if (line.domNode.textContent.length > 0 && line.domNode.textContent !== text) return true
                            // if (line.domNode.textContent.length > 0) {
                            //     line.domNode.textContent = ""
                            // }
                            // // console.log(line.domNode.textContent.length)
                            // return true
                            // } else {

                            // }
                            // quill.setSelection(range.index, range.index);
                            quill.setSelection(range.index, null);
                            // quill.focus();
                        }
                        if (keycontext.offset > 0) {
                            return true;
                        }
                        if (!format.td && !keycontext.format.td) {
                            return true;
                        }
                        const [prev] = quill.getLine(range.index - 1);
                        // console.log(line.statics, prev)
                        if (prev && prev.next) {
                            return true;
                        }
                        // if (prev != null) {
                        //     if (
                        //         prev.statics.blotName === "td" &&
                        //         line.statics.blotName !== "td"
                        //     )
                        //     return false;
                        // }
                    }
                }
            }
        }
    },
    theme: "snow"
});

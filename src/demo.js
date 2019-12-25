import Quill from "quill";
import TableModule from "./index.js";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "./css/quill.table.css";

Quill.register("modules/table", TableModule);

const defaultToolbar = [
    [
        {
            table: TableModule.tableOptions()
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
                backspace: {
                    key: "backspace",
                    handler: (range, keycontext) =>
                        TableModule.keyboardHandler("backspace", range, keycontext)
                },
                delete: {
                    key: "delete",
                    handler: (range, keycontext) =>
                        TableModule.keyboardHandler("delete", range, keycontext)
                }
            }
        }
    },
    theme: "snow"
});

window.quill = quill;

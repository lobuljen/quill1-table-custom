# QuillJS table

Test lab for creating `TABLE` functionality in QuillJS using Containers.

Code of quill is included in project so we can easily play with it in our tests.

## What the previous developers fixed

* Denied Backspace inside an empty cell
* Added ability to delete a table
* ctrl+z/ctrl+shift+z (undo/redo)
* select a cell or multiple cells

## What would be nice to add/fix

* split/merge cell feature

## Usage

see example [demo.js](../master/src/demo.js)

```
// import module
import TableModule from "quill1-table";

// register module
Quill.register("modules/table", TableModule);

// add toolbar controls in Toolbar module options
[
        {
            table: TableModule.tableOptions()
        },
        {
            table: ["append-row", "append-col", "remove-col", "remove-row", "remove-table"]
        }
]

// add keyboard bindings in Keyboard options

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
                },
                undo: {
                    ctrlKey: true,
                    key: "z",
                    handler: (range, keycontext) =>
                        TableModule.keyboardHandler("undo", range, keycontext)
                },
                redo: {
                    ctrlKey: true,
                    shiftKey: true,
                    key: "z",
                    handler: (range, keycontext) =>
                        TableModule.keyboardHandler("redo", range, keycontext)
                }
            }
        }
```

### For development
```shell script
npm install

npm run build
```

### Progress so far
* `TABLE`, `TR` and `TD` are containers - it is possible to have multiple block blots in `TD`.
* all tables, rows and cells are identified by random strings and optimize merge only those with the same id.
* It is possible to add tables by defining rows and cols count in grid.
* It is possible to add rows and columns to existing tables (accessible by buttons in toolbar).
* it is possible to copy & paste table from Word. Works ok. Needs to test edge cases.
* undo/redo. Needs to test edge cases.
* select a cell or multiple cells

### Known issues
It is early stage so there is a lot of issues with current state.
Still there are some worth to mention which should be dealt with.

* Lists (number or bullet) in cell upon enter loose list format on previous line but keeps it on actual.
* Containers need order similar to Inline.order. Otherwise delta is not canonical.
* ...

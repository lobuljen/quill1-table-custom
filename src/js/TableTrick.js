import Quill from 'quill';

let Parchment = Quill.import('parchment');
let Container = Quill.import('blots/container');
let Scroll = Quill.import('blots/scroll');

export default class TableTrick {
    static random_id() {
        return Math.random().toString(36).slice(2)
    }

    static find_td(quill) {
        let leaf = quill.getLeaf(quill.getSelection()['index']);
        let blot = leaf[0];
        for (; blot != null && blot.statics.blotName != 'td';) {
            blot = blot.parent;
        }
        return blot; // return TD or NULL
    }

    static table_handler(value, quill) {
        if (value.includes('newtable_')) {
            let node = null;
            let sizes = value.split('_');
            let row_count = Number.parseInt(sizes[1]);
            let col_count = Number.parseInt(sizes[2]);
            let table_id = TableTrick.random_id();
            let table = Parchment.create('table', table_id);
            for (var ri = 0; ri < row_count; ri++) {
                let row_id = TableTrick.random_id();
                let tr = Parchment.create('tr', row_id);
                table.appendChild(tr);
                for (var ci = 0; ci < col_count; ci++) {
                    let cell_id = TableTrick.random_id();
                    value = table_id + '|' + row_id + '|' + cell_id;
                    let td = Parchment.create('td', value);
                    tr.appendChild(td);
                    let p = Parchment.create('block');
                    td.appendChild(p);
                    let br = Parchment.create('break');
                    p.appendChild(br);
                    node = p;
                }
            }
            let leaf = quill.getLeaf(quill.getSelection()['index']);
            let blot = leaf[0];
            let top_branch = null;
            for (; blot != null && !(blot instanceof Container || blot instanceof Scroll);) {
                top_branch = blot;
                blot = blot.parent;
            }
            blot.insertBefore(table, top_branch);
            return node;
        } else if (value === 'append-col') {
            let td = TableTrick.find_td(quill);
            if (td) {
                // get cell index
                const index = Array.prototype.indexOf.call(td.parent.domNode.children, td.domNode) + 1;
                const last_cell = index === td.parent.domNode.children.length;
                let table = td.parent.parent;
                let table_id = table.domNode.getAttribute('table_id');
                table.children.forEach(function (tr) {
                    let row_id = tr.domNode.getAttribute('row_id');
                    let cell_id = TableTrick.random_id();
                    let new_td = Parchment.create('td', table_id + '|' + row_id + '|' + cell_id);
                    if (!last_cell || index === tr.domNode.children.length) {
                        if (typeof tr.domNode.children[index] === 'undefined') {
                            tr.appendChild(new_td);
                        } else {
                            let td = Parchment.find(tr.domNode.children[index]);
                            if (td) {
                                tr.insertBefore(new_td, td);
                            }
                        }
                    }
                });
            }
        } else if (value === 'remove-col') {
            let td = TableTrick.find_td(quill);
            if (td) {
                let table = td.parent.parent;
                // get cell index
                const index = Array.prototype.indexOf.call(td.parent.domNode.children, td.domNode);

                // Remove all TDs with the colIndex
                table.children.forEach(function (tr) {
                    var _td = tr.domNode.children[index];
                    if (_td) {
                        _td.remove();
                    }
                });
            }
        } else if (value === 'append-row') {
            let td = TableTrick.find_td(quill);
            if (td) {
                const tr = td.parent;
                const col_count = tr.domNode.children.length;
                const table = tr.parent;
                const new_row = tr.clone();
                // get row index
                const index = Array.prototype.indexOf.call(table.domNode.children, tr.domNode) + 1;
                
                let table_id = table.domNode.getAttribute('table_id');
                let row_id = TableTrick.random_id();
                new_row.domNode.setAttribute('row_id', row_id);
                for (let i = col_count - 1; i >= 0; i--) {
                    let cell_id = TableTrick.random_id();
                    let td = Parchment.create('td', table_id + '|' + row_id + '|' + cell_id);
                    new_row.appendChild(td);
                    let p = Parchment.create('block');
                    td.appendChild(p);
                    let br = Parchment.create('break');
                    p.appendChild(br);
                }

                if (typeof table.domNode.children[index] === 'undefined') {
                  table.appendChild(new_row);
                } else {
                  let row = Parchment.find(table.domNode.children[index]);
                  if (row) {
                    table.insertBefore(new_row, row);
                  }
                }
            }
        } else if (value === 'insert') {
            let table_id = TableTrick.random_id();
            let table = Parchment.create('table', table_id);

            let leaf = quill.getLeaf(quill.getSelection()['index']);
            let blot = leaf[0];
            let top_branch = null;
            for (; blot != null && !(blot instanceof Container || blot instanceof Scroll);) {
                top_branch = blot;
                blot = blot.parent;
            }
            blot.insertBefore(table, top_branch);
            return table;
        } else if (value === 'remove-row') {
            let td = TableTrick.find_td(quill);
            if (td) {
                let tr = td.parent;
                tr.remove();
            }
        } else if (value === 'remove-table') {
            let td = TableTrick.find_td(quill);
            if (td) {
                let table = td.parent.parent;
                table.remove();
            }
        } else if (value === 'undo') {
          // TODO: manage properly undo
          if (quill.history.stack.undo.length) {
            return !(quill.history.stack.undo[quill.history.stack.undo.length - 1].undo.ops.find(op => {
              return op.attributes && typeof op.attributes.td !== 'undefined';
            }));
          }
          return true;
        } else if (value === 'redo') {
          // TODO: manage properly redo
          if (quill.history.stack.redo.length) {
            return !(quill.history.stack.redo[quill.history.stack.redo.length - 1].redo.ops.find(op => {
              return op.attributes && typeof op.attributes.td !== 'undefined';
            }));
          }
          return true;
        }
    }
}
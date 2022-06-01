import Quill from 'quill';
import TableHistory from './TableHistory';
import TableSelection from './TableSelection';

let Parchment = Quill.import('parchment');
let Container = Quill.import('blots/container');
let Scroll = Quill.import('blots/scroll');

export default class TableTrick {
  static random_id() {
    return Math.random().toString(36).slice(2);
  }

  static getBlot(quill) {
    let blot = null;
    const selection = quill.getSelection();
    if (selection) {
      blot = quill.getLeaf(selection['index'])[0];
    }
    return blot;
  }

  static find_td(quill) {
    let blot = TableTrick.getBlot(quill);
    if (blot) {
      for (; blot != null && blot.statics.blotName !== 'td';) {
        blot = blot.parent;
      }
    }
    return blot; // return TD or NULL
  }

  static insertTable(quill, col_count, row_count) {
    const table_id = TableTrick.random_id();
    const table = Parchment.create('table', table_id);
    for (let ri = 0; ri < row_count; ri++) {
      const row_id = TableTrick.random_id();
      const tr = Parchment.create('tr', row_id);
      table.appendChild(tr);
      for (let ci = 0; ci < col_count; ci++) {
        const cell_id = TableTrick.random_id();
        const value = table_id + '|' + row_id + '|' + cell_id;
        const td = Parchment.create('td', value);
        tr.appendChild(td);
        const p = Parchment.create('block');
        td.appendChild(p);
        const br = Parchment.create('break');
        p.appendChild(br);
      }
    }
    let blot = TableTrick.getBlot(quill);
    let top_branch = null;
    for (; blot != null && !(blot instanceof Container || blot instanceof Scroll);) {
      top_branch = blot;
      blot = blot.parent;
    }
    blot.insertBefore(table, top_branch);
    TableHistory.register('insert', table.domNode, top_branch.domNode, null);
    TableHistory.add(quill);
  }

  static removeTable(quill) {
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    let table;
    if (coords) {
      const _table = TableSelection.selectionStartElement.closest('table');
      table = Parchment.find(_table);
    } else {
      const td = TableTrick.find_td(quill);
      if (td) {
        table = td.parent.parent;
      }
    }

    if (table) {
      TableHistory.register('remove', table.domNode, table.next ? table.next.domNode : null, table.parent.domNode);
      TableHistory.add(quill);
      table.remove();
    }
  }

  static addCol(quill) {
    // append col right to current cell or at rightmost cell of selection
    const coords = TableSelection.getSelectionCoords();
    let td = TableTrick.find_td(quill);
    if (coords) {
      const cell = TableSelection.getCellAt(coords.maxX, coords.minY) || TableSelection.getCellAt(coords.maxX, coords.maxY);
      if (cell) {
        td = Parchment.find(cell);
      }
    }

    if (td) {
      // get cell index
      const index = Array.prototype.indexOf.call(td.parent.domNode.children, td.domNode) + 1;
      const last_cell = index === td.parent.domNode.children.length;
      const table = td.parent.parent;
      const table_id = table.domNode.getAttribute('table_id');
      table.children.forEach(function (tr) {
        const row_id = tr.domNode.getAttribute('row_id');
        const cell_id = TableTrick.random_id();
        const new_td = Parchment.create('td', table_id + '|' + row_id + '|' + cell_id);
        if (!last_cell || index === tr.domNode.children.length) {
          if (typeof tr.domNode.children[index] === 'undefined') {
            tr.appendChild(new_td);
            TableHistory.register('insert', new_td.domNode, null, tr.domNode);
          } else {
            const td = Parchment.find(tr.domNode.children[index]);
            if (td) {
              tr.insertBefore(new_td, td);
              TableHistory.register('insert', new_td.domNode, td.domNode, null);
            }
          }
        }
      });
      TableHistory.add(quill);
    }
  }

  static addRow(quill) {
    // append row below current cell or at bottommost cell of selection
    const coords = TableSelection.getSelectionCoords();
    let td = TableTrick.find_td(quill);
    if (coords) {
      const cell = TableSelection.getCellAt(coords.minX, coords.maxY) || TableSelection.getCellAt(coords.maxX, coords.maxY);
      if (cell) {
        td = Parchment.find(cell);
      }
    }

    if (td) {
      const tr = td.parent;
      const col_count = tr.domNode.children.length;
      const table = tr.parent;
      const new_row = tr.clone();
      // get row index
      const index = Array.prototype.indexOf.call(table.domNode.children, tr.domNode) + 1;

      const table_id = table.domNode.getAttribute('table_id');
      const row_id = TableTrick.random_id();
      new_row.domNode.setAttribute('row_id', row_id);
      for (let i = col_count - 1; i >= 0; i--) {
        const cell_id = TableTrick.random_id();
        const td = Parchment.create('td', table_id + '|' + row_id + '|' + cell_id);
        new_row.appendChild(td);
        const p = Parchment.create('block');
        td.appendChild(p);
        const br = Parchment.create('break');
        p.appendChild(br);
      }

      if (typeof table.domNode.children[index] === 'undefined') {
        table.appendChild(new_row);
        TableHistory.register('insert', new_row.domNode, null, table.domNode);
      } else {
        const row = Parchment.find(table.domNode.children[index]);
        if (row) {
          table.insertBefore(new_row, row);
          TableHistory.register('insert', new_row.domNode, row.domNode, null);
        }
      }
      TableHistory.add(quill);
    }
  }

  static removeCol(quill) {
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    let table, colIndex, colsToRemove;
    if (coords) {
      // if we have a selection, remove all selected columns
      const _table = TableSelection.selectionStartElement.closest('table');
      table = Parchment.find(_table);
      colIndex = coords.minX;
      colsToRemove = coords.maxX - coords.minX + 1;
    } else {
      // otherwise, remove only the column of current cell
      colsToRemove = 1;
      const td = TableTrick.find_td(quill);
      if (td) {
        table = td.parent.parent;
        colIndex = Array.prototype.indexOf.call(td.parent.domNode.children, td.domNode);
      }
    }

    if (table && typeof colIndex === 'number' && typeof colsToRemove === 'number') {
      // Remove all TDs with the colIndex and repeat it colsToRemove times if there are multiple columns to delete
      for (let i = 0; i < colsToRemove; i++) {
        table.children.forEach(function (tr) {
          const _td = tr.domNode.children[colIndex];
          if (_td) {
            TableHistory.register('remove', _td, _td.nextSibling, tr.domNode);
            _td.remove();
          }
        });
      }
      TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
      TableHistory.add(quill);
    }
  }

  static removeRow(quill) {
    const coords = TableSelection.getSelectionCoords();
    TableSelection.resetSelection(quill.container);
    if (coords) {
      // if we have a selection, remove all selected rows
      const table = TableSelection.selectionStartElement.closest('table');
      const rowIndex = coords.minY;
      const rowsToRemove = coords.maxY - coords.minY + 1;

      for (let i = 0; i < rowsToRemove; i++) {
        const _tr = table.children[rowIndex];
        if (_tr) {
          TableHistory.register('remove', _tr, _tr.nextSibling, table);
          _tr.remove();
        }
      }
    } else {
      // otherwise, remove only the row of current cell
      const td = TableTrick.find_td(quill);
      if (td) {
        const tr = td.parent;
        TableHistory.register('remove', tr.domNode, tr.next ? tr.next.domNode : null, tr.parent.domNode);
        tr.remove();
      }
    }
    TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
    TableHistory.add(quill);
  }

  static table_handler(value, quill) {
    if (value.includes('newtable_')) {
      const sizes = value.split('_');
      const row_count = Number.parseInt(sizes[1]);
      const col_count = Number.parseInt(sizes[2]);
      TableTrick.insertTable(quill, col_count, row_count);
    } else if (value === 'append-col') {
      TableTrick.addCol(quill);
    } else if (value === 'remove-col') {
      TableTrick.removeCol(quill);
    } else if (value === 'append-row') {
      TableTrick.addRow(quill);
    } else if (value === 'remove-row') {
      TableTrick.removeRow(quill);
    } else if (value === 'insert') {
      TableTrick.insertTable(quill, 1, 1);
    } else if (value === 'remove-table') {
      TableTrick.removeTable(quill);
    } else if (value === 'undo') {
      if (quill.history.stack.undo.length) {
        const entry = quill.history.stack.undo[quill.history.stack.undo.length - 1];
        if (typeof entry.type !== 'undefined' && typeof entry.id !== 'undefined' && entry.type === 'tableHistory') {
          // Table history entry
          TableHistory.undo(entry.id);
          return false;
        }
        // Classic history entry
      }
      return true;
    } else if (value === 'redo') {
      if (quill.history.stack.redo.length) {
        const entry = quill.history.stack.redo[quill.history.stack.redo.length - 1];
        if (typeof entry.type !== 'undefined' && typeof entry.id !== 'undefined' && entry.type === 'tableHistory') {
          // Table history entry
          TableHistory.redo(entry.id);
          return false;
        }
        // Classic history entry
      }
      return true;
    }
  }
}
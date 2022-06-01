class TableSelection {
  static focusedCell = null;
  static isMouseDown = false;
  static selectionStartElement = null;
  static selectionEndElement = null;

  static dblClickTimeout = null;
  static clickedCellTimeout = null;
  static preventMouseDown = true;

  static mouseDown(e) {
    if (e.which !== 1) {
      // do nothing with center or right click
      return;
    }

    TableSelection.isMouseDown = true;
    // reset cell selection
    TableSelection.selectionStartElement = TableSelection.selectionEndElement = null;
    TableSelection.resetSelection(e.currentTarget);

    const targetCell = TableSelection.getTargetCell(e);
    if (!targetCell) {
      // default mouse down event when clicking outside a cell
      TableSelection.focusedCell = null;
      return;
    }

    if ((!TableSelection.preventMouseDown && targetCell === TableSelection.clickedCellTimeout) || TableSelection.focusedCell === targetCell) {
      // default mouse down event when multiple click in less than 500ms in the same cell or if the cell is already focused
      TableSelection.focusedCell = targetCell;
      return;
    }

    // single mouse left click = start selection
    e.preventDefault();
    TableSelection.focusedCell = null;

    clearTimeout(TableSelection.dblClickTimeout);
    TableSelection.dblClickTimeout = setTimeout(() => {
      TableSelection.preventMouseDown = true;
      TableSelection.clickedCellTimeout = null;
    }, 500);
    TableSelection.preventMouseDown = false;

    TableSelection.selectionStartElement = TableSelection.clickedCellTimeout = targetCell;

    if (TableSelection.selectionStartElement) {
      TableSelection.selectionStartElement.classList.add('ql-cell-selected');
    }
  }

  static mouseMove(e) {
    if (TableSelection.isMouseDown && TableSelection.selectionStartElement) {
      const previousSelectionEndElement = TableSelection.selectionEndElement;
      TableSelection.selectionEndElement = TableSelection.getTargetCell(e);
      // Update selection if: mouse button is down, selection changed, start and end element exist and are in the same table
      if (
        TableSelection.selectionEndElement &&
        TableSelection.selectionEndElement !== previousSelectionEndElement &&
        TableSelection.selectionStartElement.closest('table') === TableSelection.selectionEndElement.closest('table')
      ) {
        TableSelection.resetSelection(e.currentTarget);

        // set new selection
        const coords = TableSelection.getSelectionCoords();
        for (let y = coords.minY; y <= coords.maxY; y++) {
          for (let x = coords.minX; x <= coords.maxX; x++) {
            let cell = TableSelection.getCellAt(x, y);
            if (cell) {
              cell.classList.add('ql-cell-selected');
            }
          }
        }
      }
    }
  }

  static mouseUp(e) {
    TableSelection.isMouseDown = false;
    if (!TableSelection.selectionEndElement) {
      TableSelection.selectionEndElement = TableSelection.selectionStartElement;
    }
  }

  static getSelectionCoords() {
    if (TableSelection.selectionStartElement && TableSelection.selectionEndElement) {
      const coords = [
        [
          Array.prototype.indexOf.call(TableSelection.selectionStartElement.parentElement.children, TableSelection.selectionStartElement),
          Array.prototype.indexOf.call(TableSelection.selectionStartElement.parentElement.parentElement.children, TableSelection.selectionStartElement.parentElement)
        ],
        [
          Array.prototype.indexOf.call(TableSelection.selectionEndElement.parentElement.children, TableSelection.selectionEndElement),
          Array.prototype.indexOf.call(TableSelection.selectionEndElement.parentElement.parentElement.children, TableSelection.selectionEndElement.parentElement)
        ]
      ];

      return {
        coords,
        minX: Math.min(coords[0][0], coords[1][0]),
        maxX: Math.max(coords[0][0], coords[1][0]),
        minY: Math.min(coords[0][1], coords[1][1]),
        maxY: Math.max(coords[0][1], coords[1][1])
      };
    }
    return null;
  }

  static getCellAt(x, y) {
    const currentTable = TableSelection.selectionStartElement.closest('table');
    if (currentTable) {
      if (typeof currentTable.children[y] !== 'undefined' && typeof currentTable.children[y].children[x] !== 'undefined') {
        return currentTable.children[y].children[x];
      }
    }
    return null;
  }

  static getTargetCell(e) {
    let element = e.target;
    let cell = null;
    do {
      if (['td', 'th'].includes(element.tagName.toLowerCase())) {
        cell = element;
        break;
      }
      element = element.parentNode;
    } while (element && element !== e.currentTarget);
    return cell;
  }

  static resetSelection(container) {
    container.querySelectorAll('td.ql-cell-selected').forEach(cell => {
      cell.classList.remove('ql-cell-selected');
    });
  }
}

export default TableSelection;
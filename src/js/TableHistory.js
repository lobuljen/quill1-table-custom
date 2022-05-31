import TableTrick from './TableTrick';

class TableHistory {
  static changes = [];

  // Register DOM change into current table history entry
  static register(type, node, nextNode, parentNode) {
    TableHistory.changes.push({ type, node, nextNode, parentNode });
  }

  // Add table history entry
  static add(quill) {
    if (!TableHistory.changes.length) return;

    const historyChangeStatus = quill.history.ignoreChange;
    // ignore history change and reset last recorded time for adding later changes in a new history entry
    quill.history.ignoreChange = true;
    quill.history.lastRecorded = 0;

    // wait history update
    setTimeout(() => {
      // reset history changes value
      quill.history.ignoreChange = historyChangeStatus;

      // add new entry in table stack
      const id = TableTrick.random_id();
      quill.history.tableStack[id] = TableHistory.changes;

      // set reference to table stack entry in a new history entry
      quill.history.stack.undo.push({type: 'tableHistory', id: id});

      TableHistory.changes = [];
    }, 0);
  }

  static undo(id) {
    const historyChangeStatus = quill.history.ignoreChange;
    quill.history.ignoreChange = true;

    const entry = quill.history.tableStack[id];
    if (typeof entry !== 'undefined') {
      // apply changes from last change to first change (undo)
      entry.reverse().forEach(change => {
        switch (change.type) {
          case 'insert':
            // remove node (undo)
            TableHistory.remove(change);
            break;
          case 'remove':
            // add node (undo)
            TableHistory.insert(change);
            break;
        }
      });
    }

    // wait history update
    setTimeout(() => {
      // update history
      const historyEntry = quill.history.stack.undo.pop();
      quill.history.stack.redo.push(historyEntry);
      quill.history.ignoreChange = historyChangeStatus;
    }, 0);
  }

  static redo(id) {
    const historyChangeStatus = quill.history.ignoreChange;
    quill.history.ignoreChange = true;

    const entry = quill.history.tableStack[id];
    if (typeof entry !== 'undefined') {
      // apply changes from first change to last change (redo)
      entry.forEach(change => {
        switch (change.type) {
          case 'insert':
            // add node (redo)
            TableHistory.insert(change);
            break;
          case 'remove':
            // remove node (redo)
            TableHistory.remove(change);
            break;
        }
      });
    }

    // wait history update
    setTimeout(() => {
      // update history
      const historyEntry = quill.history.stack.redo.pop();
      quill.history.stack.undo.push(historyEntry);
      quill.history.ignoreChange = historyChangeStatus;
    }, 0);
  }

  static insert(change) {
    let parentNode = change.parentNode || change.nextNode.parentNode;
    if (parentNode) {
      if (change.nextNode) {
        parentNode.insertBefore(change.node, change.nextNode);
      } else {
        parentNode.appendChild(change.node);
      }
      return true;
    }
    return false;
  }

  static remove(change) {
    change.node.remove();
    return true;
  }
}

export default TableHistory;
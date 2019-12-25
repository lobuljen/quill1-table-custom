var removeNodeChildren = function removeNodeChildren(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

var keyboardHandler = function keyboardHandler(key, range, keycontext) {
    var quill = window.quill;
    var format_start = quill.getFormat(range.index - 1);
    var format_end = quill.getFormat(range.index + range.length);
    // если событие не в ячейки, то передать стандартному обработчику
    if (!format_start.td && !keycontext.format.td && !format_end.td) {
        return true;
    }
    // если выделение у границы ячейки
    if (range.length > 0) {
        var selection = window.getSelection();
        var nodeList = document.querySelectorAll(".ql-editor p");
        // удалить выделенное содержимое
        var resultNodes = nodeListToArray(nodeList).filter(function (cell) {
            return selection.containsNode(cell, true);
        });
        // удаление не затрагивает ячейку
        if (resultNodes.length <= 1) return true;
        var _range = selection.getRangeAt(0);
        var offset = 0;
        resultNodes.forEach(function (node, i) {
            var tempRange = document.createRange();
            tempRange.selectNodeContents(node);
            tempRange.setEnd(_range.startContainer, _range.startOffset);
            var before = tempRange.toString();
            tempRange.selectNodeContents(node);
            tempRange.setStart(_range.endContainer, _range.endOffset);
            var after = tempRange.toString();
            removeNodeChildren(node);
            if (i === 0 && keycontext.offset > 0) {
                if (before.length > 0) {
                    offset = before.length;
                    var newtext = document.createTextNode(before);
                    node.appendChild(newtext);
                } else {
                    node.remove();
                }
            } else if (i === resultNodes.length - 1) {
                if (after.length > 0) {
                    var _newtext = document.createTextNode(after);
                    node.appendChild(_newtext);
                } else {
                    node.remove();
                }
            } else {
                node.remove();
            }
        });
        // убрать выделение
        if (resultNodes[0].firstChild) {
            window.getSelection().collapse(resultNodes[0].firstChild, offset);
        } else {
            window.getSelection().collapse(resultNodes[0], 0);
        }
        return false;
    }
    // если удаляем не у границы ячейки, то передать стандартному обработчику
    if (key === "backspace" && keycontext.offset > 0) {
        return true;
    }
    var node = quill.selection.getNativeRange().start.node;
    if (!node) return false;
    var blot = Parchment.find(node);

    if (key === "delete" && blot && keycontext.offset < (blot.text ? blot.text.length : 0)) {
        return true;
    }

    var _quill$getLine = quill.getLine(range.index - 1),
        _quill$getLine2 = (0, _slicedToArray3.default)(_quill$getLine, 1),
        prev = _quill$getLine2[0];

    var _quill$getLine3 = quill.getLine(range.index + 1),
        _quill$getLine4 = (0, _slicedToArray3.default)(_quill$getLine3, 1),
        next = _quill$getLine4[0];
    // если в ячейки несколько строк, то можно удалять стандартно


    if (key === "backspace" && prev && prev.next) {
        return true;
    }
    if (key === "delete" && next && next.prev) {
        return true;
    }
};

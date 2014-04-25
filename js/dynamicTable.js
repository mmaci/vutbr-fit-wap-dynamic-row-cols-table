var dynamicTable = new function() {

    var html = document.documentElement;
    var table = null;
    var body = document.body;

    var isMouseDown = false;
    var lastTarget = null;
    var currentTarget = null;
    var downTarget = null;

    var mouseCoords = null;
    var sliderCoord = null;
    var origHeight = null;
    var origWidth = null;
    var origColspan = null;
    var origOffset = null;
    var startX = null;
    var startY = null;
    var moveX = null;
    var moveY = null;
    var isResizeTableX = false;
    var isResizeTableY = false;

    var cellsToResize;
    var cellsToResizeWidth;


    /**
     * Returns current [x,y] coordinates of the mouse.
     * @param {type} event
     * @returns {x, y}
     */
    var getMouseCoords = function(event) {
        if (event.pageX || event.pageY) {
            return {x: event.pageX, y: event.pageY};
        }
        return {
            x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: event.clientY + document.body.scrollTop - document.body.clientTop
        };
    };

    /**
     * Returns [x,y] offset from a specified object.
     * @param {type} target
     * @param {type} event
     * @returns {x, y}
     */
    var getMouseOffset = function(target, event) {
        event = event || window.event;
        var docPos = getPosition(target);
        var mousePos = getMouseCoords(event);
        return {x: mousePos.x - docPos.x, y: mousePos.y - docPos.y};
    };


    /**
     * Returns [x,y] position of an element. Traverses through all ancestors and adds
     * their top and left offsets.
     * @param {type} target
     * @returns {x, y}
     */
    var getPosition = function(target) {
        var left = 0;
        var top = 0;

        while (target.offsetParent) {
            left += target.offsetLeft;
            top += target.offsetTop;
            target = target.offsetParent;
        }

        left += target.offsetLeft;
        top += target.offsetTop;

        return {x: left, y: top};
    };

    /**
     * Sets an object that is being dragged
     * @param {type} object
     * @returns false
     */
    var setDragObject = function(object) {
        if (!object)
            return;

        downTarget = object;
        currentTarget = object;
        em(object, '#ff0000');
    };


    /**
     * Unsets all variables after releasing mouse click
     * @returns {undefined}
     */
    var unsetDragObject = function() {
        if (downTarget)
            clear(downTarget);
        if (lastTarget)
            clear(lastTarget);

        downTarget = null;
        currentTarget = null;
        lastTarget = null;
    };


    /**
     * Emphasizes an object
     * @param {type} target
     * @param {type} color
     * @returns {undefined}
     */
    var em = function(target, color) {
        target.style.borderWidth = '3px';
        target.style.borderColor = color;
        target.style.borderStyle = 'solid';
        target.style.cursor = 'move';
    };


    /**
     * Clears object emphesize
     * @param {type} target
     * @returns {undefined}
     */
    var clear = function(target) {
        target.style.borderWidth = '1px 1px 0 0';
        target.style.borderColor = '#aaa';
        target.style.borderStyle = 'solid';
        target.style.cursor = 'auto';
    };

    /**
     * Fires while we move with mouse and hold down button
     * @param {type} event
     * @returns {Boolean}
     */
    var mouseMove = function(event) {

        event = event || window.event;
        var target = event.target || event.srcElement;
        if (isMouseDown && target.tagName === "TH" && target.parentNode.rowIndex === 0 && target.cellIndex !== 0) {

            currentTarget = target;

            // coloring
            if (lastTarget && (lastTarget !== downTarget)) {
                clear(lastTarget);
            }

            if (currentTarget !== downTarget) {
                em(currentTarget, '#0000ff');
            }

            lastTarget = target;
        }
        return false;
    };


    /**
     * Fired when we click mouse button
     * @param {type} event
     * @returns {Boolean}
     */
    var mouseDown = function(event) {
        var target = event.target || event.srcElement;

        if (target.tagName === "TH" && target.parentNode.rowIndex === 0 && target.cellIndex !== 0) {
            table = target.parentNode.parentNode.parentNode;
            isMouseDown = true;
            setDragObject(target);
        }

        return false;
    };

    /**
     * Fired when we release mouse click
     * @param {type} event
     * @returns {undefined}
     */
    var mouseUp = function(event) {
        isMouseDown = false;
        // down swap columns in case its not a table header

        if (currentTarget)
            rowIndex1 = currentTarget.parentNode.rowIndex;
        if (downTarget)
            rowIndex2 = downTarget.parentNode.rowIndex;

        if (currentTarget !== downTarget && rowIndex1 === 0 && rowIndex2 === 0) {
            swapColumns(table, currentTarget.cellIndex, downTarget.cellIndex);
        }

        unsetDragObject();
    };

    /**     
     * @param {type} table
     * @param {type} row
     * @param {type} cellIndex1
     * @param {type} cellIndex2
     * @returns {undefined}
     */
    var swapCells = function(table, row, cellIndex1, cellIndex2) {

        var leftCellIndex = Math.min(cellIndex1, cellIndex2);
        var rightCellIndex = Math.max(cellIndex1, cellIndex2);

        var leftCell = row.cells[leftCellIndex];
        var rightCell = row.cells[rightCellIndex];

        if (row.cells.length !== (rightCellIndex + 1)) { // isnt the last column
            var rightRightCell = row.cells[rightCellIndex + 1];
            row.insertBefore(rightCell, leftCell);
            row.insertBefore(leftCell, rightRightCell);
        } else {
            row.insertBefore(rightCell, leftCell);
            row.appendChild(leftCell);
        }
    };

    /**     
     * @param {type} table
     * @param {type} row
     * @param {type} leftCells
     * @param {type} rightCells
     * @returns {undefined}
     */
    var swapCellArrays = function(table, row, leftCells, rightCells) {

        if (leftCells.length === 0 || rightCells.length === 0)
            return;

        // last cell is at the end
        if (row.length >= rightCells[rightCells.length - 1].cellIndex) {
            for (var i = rightCells.length - 1; i >= 0; i--) {
                row.insertBefore(leftCells[0], rightCells[i]);
            }
            for (var i = 0; i < leftCells.length; i++) {
                row.appendChild(leftCells[i]);
            }
        }

        else {
            var rightRightCellIndex = rightCells[rightCells.length - 1].cellIndex + 1;
            var rightRightCell = row.cells[rightRightCellIndex];

            var beforeCell = leftCells[0];
            for (var i = rightCells.length - 1; i >= 0; i--) {
                row.insertBefore(rightCells[i], beforeCell);
                beforeCell = rightCells[i];
            }
            for (var i = leftCells.length - 1; i >= 0; i--) {
                row.insertBefore(leftCells[i], rightRightCell);
                rightRightCell = leftCells[i];
            }
        }
    };


    /**
     * Swaps table columns based on table 
     * @param {type} table
     * @param {type} cellIndex1
     * @param {type} cellIndex2
     * @returns {Boolean}
     */
    var swapColumns = function(table, cellIndex1, cellIndex2) {

        if (table && (cellIndex1 !== cellIndex2)) {

            var leftCellIndex = Math.min(cellIndex1, cellIndex2);
            var rightCellIndex = Math.max(cellIndex1, cellIndex2);

            var leftColSpan = table.rows[0].cells[leftCellIndex].colSpan;
            var rightColSpan = table.rows[0].cells[rightCellIndex].colSpan;

            var offsetLeft = 0, offsetRight = 0;
            for (var i = 0; i < table.rows.length; i++) {
                var row = table.rows[i];

                // first row (header)                
                if (i === 0) {
                    for (var j = 0; j < row.cells.length; j++) {
                        var cell = row.cells[j];
                        // calculate left cell and right cell offsets from the left
                        if (j < leftCellIndex) {
                            offsetLeft += cell.colSpan;
                        }
                        if (j < rightCellIndex) {
                            offsetRight += cell.colSpan;
                        }
                    }
                    swapCells(table, row, cellIndex1, cellIndex2);
                }
                // other rows
                else {

                    var offset = 0;
                    var leftCells = new Array(), rightCells = new Array();
                    for (var j = 0; j < row.cells.length; j++) {
                        var cell = row.cells[j];

                        if (offset >= offsetLeft && offset < offsetLeft + leftColSpan)
                            leftCells.push(cell);

                        if (offset >= offsetRight && offset < offsetRight + rightColSpan)
                            rightCells.push(cell);

                        if (offset > offsetRight + rightColSpan)
                            break;

                        offset += cell.colSpan;
                    }
                    swapCellArrays(table, row, leftCells, rightCells);
                }
            }
        }
        return false;
    };

    /**
     * Returns variables to original state after cell resize
     * @param {type} event
     * @returns {undefined}
     */
    var mouseUpTable = function(event) {
        isResizeTableY = false;
        isResizeTableX = false;

        document.onmousemove = mouseMove;
        document.onmouseup = mouseUp;
    };

    /**
     * Fired when grabbing a slider for resizing height
     * @param {type} event
     * @returns {undefined}
     */
    var mouseDownTableVertical = function(event) {
        var target = event.target || event.srcElement;
        table = target.parentNode.parentNode.parentNode.parentNode;
        isResizeTableY = true;

        mouseCoords = getMouseCoords(event);
        sliderCoord = event.target.parentNode.parentNode.rowIndex;

        startY = mouseCoords.y;
        origHeight = table.rows[sliderCoord].cells[0].clientHeight;

        document.onmousemove = mouseMoveTableVertical;
        document.onmouseup = mouseUpTable;
    };


    /**
     * Fired when resizing the height while moving mouse
     * @param {type} event
     * @returns {undefined}
     */
    var mouseMoveTableVertical = function(event) {
        if (isResizeTableY) {
            mouseCoords = getMouseCoords(event);
            moveY = mouseCoords.y - startY;
            var newHeight = moveY + origHeight;

            for (var i = 0; i < table.rows[sliderCoord].cells.length; ++i) {
                var cell = table.rows[sliderCoord].cells[i];
                cell.style.height = newHeight + 'px';
            }

            table.rows[sliderCoord].cells[0].clientHeight = newHeight;
        }
    };


    /**
     * Fired when grabbin slider for resizing width
     * @param {type} event
     * @returns {undefined}
     */
    var mouseDownTableHorizontal = function(event) {
        var target = event.target || event.srcElement;
        table = target.parentNode.parentNode.parentNode.parentNode;
        isResizeTableX = true;

        mouseCoords = getMouseCoords(event);
        sliderCoord = event.target.parentNode.cellIndex;

        startX = mouseCoords.x;

        origWidth = table.rows[0].cells[sliderCoord].clientWidth;
        origColspan = table.rows[0].cells[sliderCoord].colSpan;
        origOffset = 0;
        for (var i = 0; i < sliderCoord; i++) {
            var cell = table.rows[0].cells[i];
            origOffset += cell.colSpan;
        }

        cellsToResize = new Array();
        cellsToResizeWidth = new Array();

        for (var j = 1; j < table.rows.length; ++j) {
            var row = table.rows[j];
            var totalColspan = 0;
            var cell = null;
            for (var i = 0; totalColspan < origOffset + origColspan; i++) {
                var cell = row.cells[i];
                totalColspan += cell.colSpan;
            }
            cell = row.cells[i - 1];

            cellsToResize.push(cell);
            cellsToResizeWidth.push(cell.clientWidth);
        }

        document.onmousemove = mouseMoveTableHorizontal;
        document.onmouseup = mouseUpTable;
    };


    /**
     * Fired when resizing the width while moving mouse
     * @param {type} event
     * @returns {undefined}
     */
    var mouseMoveTableHorizontal = function(event) {
        if (isResizeTableX) {
            mouseCoords = getMouseCoords(event);
            moveX = mouseCoords.x - startX;

            var firstCell = table.rows[0].cells[sliderCoord];
            var newWidth = moveX + origWidth;
            firstCell.clientWidth = newWidth;
            firstCell.style.width = newWidth + 'px';

            for (var i = 0; i < cellsToResize.length; i++) {
                var newWidth = moveX + cellsToResizeWidth[i];
                cellsToResize[i].clientWidth = newWidth;
                cellsToResize[i].style.width = newWidth + 'px';
            }

        }
        return false;
    };


    /**     
     * @param {type} tableId
     * @returns {undefined}
     */
    this.setTable = function(tableId) {

        table = document.getElementById(tableId);

        document.onmousemove = mouseMove;
        document.onmouseup = mouseUp;
        document.onmousedown = mouseDown;


        for (var j = 0; j < table.rows.length; j++) { // rows
            var row = table.rows[j];

            /* vertical sliders */
            if (j !== 0) {
                row.cells[0].innerHTML = row.cells[0].innerHTML + "<div id='" + tableId + "_y-" + j + "' class='dy'></div>";
                var dy = document.getElementById(tableId + '_y-' + j);
                dy.onmousedown = mouseDownTableVertical;
            }

            /* horizontal sliders */
            for (var i = 0; i < row.cells.length; i++) { // columns        
                var cell = row.cells[i];

                if (j === 0 && i !== 0) {
                    cell.innerHTML = "<div id='" + tableId + "_x-" + i + "' class='dx'></div>" + cell.innerHTML;
                    var dx = document.getElementById(tableId + '_x-' + i);
                    dx.onmousedown = mouseDownTableHorizontal;
                }
            }
        }
    };

};



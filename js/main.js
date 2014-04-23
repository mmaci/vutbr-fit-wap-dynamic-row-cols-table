
var html = document.documentElement;
var table = document.getElementById('dynamic');
var body = document.body;

var isMouseDown = false;
var lastTarget = null;
var currentTarget = null;
var downTarget = null;

var mouseCoords = null;
var sliderCoord = null;
var origHeight = null;
var origWidth = null;
var startX = null;
var startY = null;
var moveX = null;
var moveY = null;
var isResizeTableX = false;
var isResizeTableY = false;

/**
 * Returns current [x,y] coordinates of the mouse.
 * @param {type} event
 * @returns {x, y}
 */
function getMouseCoords(event) {
    if (event.pageX || event.pageY) {
        return {x: event.pageX, y: event.pageY};
    }
    return {
        x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: event.clientY + document.body.scrollTop - document.body.clientTop
    };
}

/**
 * Returns [x,y] offset from a specified object.
 * @param {type} target
 * @param {type} event
 * @returns {x, y}
 */
function getMouseOffset(target, event) {
    event = event || window.event;
    var docPos = getPosition(target);
    var mousePos = getMouseCoords(event);
    return {x: mousePos.x - docPos.x, y: mousePos.y - docPos.y};
}


/**
 * Returns [x,y] position of an element. Traverses through all ancestors and adds
 * their top and left offsets.
 * @param {type} target
 * @returns {x, y}
 */
function getPosition(target) {
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
}


/**
 * Sets an object that is being dragged
 * @param {type} object
 * @returns false
 */
function setDragObject(object) {
    if (!object)
        return;

    downTarget = object;
    currentTarget = object;
    em(object, '#ff0000');
}


/**
 * Unsets all variables after releasing mouse click
 * @returns {undefined}
 */
function unsetDragObject() {
    clear(downTarget);
    clear(lastTarget);

    downTarget = null;
    currentTarget = null;
    lastTarget = null;
}


/**
 * Emphasizes an object
 * @param {type} target
 * @param {type} color
 * @returns {undefined}
 */
function em(target, color) {
    target.style.borderWidth = '3px';
    target.style.borderColor = color;
    target.style.borderStyle = 'solid';
    target.style.cursor = 'move';
}


/**
 * Clears object emphesize
 * @param {type} target
 * @returns {undefined}
 */
function clear(target) {
    target.style.borderWidth = '1px 1px 0 0';
    target.style.borderColor = '#ccc';
    target.style.borderStyle = 'solid';
    target.style.cursor = 'auto';
}

/**
 * Fires while we move with mouse and hold down button
 * @param {type} event
 * @returns {Boolean}
 */
function mouseMove(event) {

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
}


/**
 * Fired when we click mouse button
 * @param {type} event
 * @returns {Boolean}
 */
function mouseDown(event) {    
    var target = event.target || event.srcElement;
        
    if (target.tagName === "TH" && target.parentNode.rowIndex === 0 && target.cellIndex !== 0) {
        isMouseDown = true;        
        setDragObject(target);
    }

    return false;
}

/**
 * Fired when we release mouse click
 * @param {type} event
 * @returns {undefined}
 */
function mouseUp(event) {
    isMouseDown = false;

    rowIndex1 = currentTarget.parentNode.rowIndex;
    rowIndex2 = downTarget.parentNode.rowIndex;

    // down swap columns in case its not a table header

    if (currentTarget !== downTarget && rowIndex1 === 0 && rowIndex2 === 0) {
        swapColumns(table, currentTarget.cellIndex, downTarget.cellIndex);
    }

    unsetDragObject();
}

/**
 * Swaps table columns based on table 
 * @param {type} table
 * @param {type} cellIndex1
 * @param {type} cellIndex2
 * @returns {Boolean}
 */
function swapColumns(table, cellIndex1, cellIndex2) {

    if (table && (cellIndex1 !== cellIndex2)) {

        for (var i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];

            var leftCellIndex = Math.min(cellIndex1, cellIndex2);
            var rightCellIndex = Math.max(cellIndex1, cellIndex2)

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
        }
    }

    return false;
}

/**
 * Returns variables to original state after cell resize
 * @param {type} event
 * @returns {undefined}
 */
function mouseUpTable(event) {
    isResizeTableY = false;
    isResizeTableX = false;
    
    document.onmousemove = mouseMove; 
    document.onmouseup = mouseUp;
}

/**
 * Fired when grabbing a slider for resizing height
 * @param {type} event
 * @returns {undefined}
 */
function mouseDownTableVertical(event) {
        var target = event.target || event.srcElement;
    
    isResizeTableY = true;
    
    mouseCoords = getMouseCoords(event);    
    sliderCoord = event.target.parentNode.parentNode.rowIndex;
    
    startY = mouseCoords.y;
    origHeight = table.rows[sliderCoord].cells[0].clientHeight;

    document.onmousemove = mouseMoveTableVertical;
    document.onmouseup = mouseUpTable;
 }


/**
 * Fired when resizing the height while moving mouse
 * @param {type} event
 * @returns {undefined}
 */
function mouseMoveTableVertical(event) {
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
}


/**
 * Fired when grabbin slider for resizing width
 * @param {type} event
 * @returns {undefined}
 */
function mouseDownTableHorizontal(event) {
    isResizeTableX = true;
    
    mouseCoords = getMouseCoords(event);
    sliderCoord = event.target.parentNode.cellIndex;
    
    startX = mouseCoords.x;
    
    origWidth = table.rows[0].cells[sliderCoord].clientWidth;

    document.onmousemove = mouseMoveTableHorizontal;
    document.onmouseup = mouseUpTable;
}


/**
 * Fired when resizing the width while moving mouse
 * @param {type} event
 * @returns {undefined}
 */
function mouseMoveTableHorizontal(event) {
    if (isResizeTableX) {        
        mouseCoords = getMouseCoords(event);        
        moveX = mouseCoords.x - startX;
        var newWidth = moveX + origWidth;

        for (var j = 0; j < table.rows.length; ++j) {
            var cell = table.rows[j].cells[sliderCoord];
            cell.style.width = newWidth + 'px';
        }
        table.rows[0].cells[sliderCoord].clientWidth = newWidth;
    }
}

/* set default mouse actions */
document.onmousemove = mouseMove;
document.onmouseup = mouseUp;
document.onmousedown = mouseDown;


/* set up sliders and their actions */

for (var j = 0; j < table.rows.length; j++) { // rows
    var row = this.table.rows[j];

    /* vertical sliders */    
    if (j !== 0) {
        row.cells[0].innerHTML = row.cells[0].innerHTML + "<div id='dy-" + j + "' class='dy'></div>";
        var dy = document.getElementById('dy-' + j);
        dy.onmousedown = mouseDownTableVertical;
    }

    /* horizontal sliders */
    for (var i = 0; i < row.cells.length; i++) { // columns        
        var cell = row.cells[i];

        if (j === 0 && i !== 0) {
            cell.innerHTML = "<div id='dx-" + i + "' class='dx'></div>" + cell.innerHTML;
            var dx = document.getElementById('dx-' + i);
            dx.onmousedown = mouseDownTableHorizontal;
        }
    }
}


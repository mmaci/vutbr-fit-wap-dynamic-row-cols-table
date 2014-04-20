
var html = document.documentElement;
var table = document.getElementById('dynamic');

var dragObject = null;
var mouseOffset = null;
var isMouseDown = null;

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

    object.onmousedown = function(event) {
        dragObject = this;
        mouseOffset = getMouseOffset(this, event);
        return false;
    };
}






function em(target, color) {
    target.style.borderWidth = '3px';
    target.style.borderColor = color;
    target.style.borderStyle = 'solid';
    target.style.cursor = 'move';
}

function clear(target) {
    target.style.borderWidth = '1px 1px 0 0';
    target.style.borderColor = '#ccc';
    target.style.borderStyle = 'solid';
    target.style.cursor = 'auto';
}

var lastTarget = null;
var currentTarget = null;
var downTarget = null;

function mouseMove(event) {

    event = event || window.event;
    var target = event.target || event.srcElement;
    if (isMouseDown) {

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

function mouseDown(event) {
    isMouseDown = true;
    var target = event.target || event.srcElement;

    downTarget = target;
    em(downTarget, '#ff0000');

    return false;
}

function mouseUp(event) {

    rowIndex1 = currentTarget.parentNode.rowIndex;
    rowIndex2 = downTarget.parentNode.rowIndex;

    // down swap columns in case its not a table header

    if (currentTarget !== downTarget && rowIndex1 === 0 && rowIndex2 === 0) {
        swapColumns(table, currentTarget.cellIndex, downTarget.cellIndex);
    }
    clear(downTarget);
    clear(lastTarget);

    currentTarget = null;
    downTarget = null;
    isMouseDown = false;
}

document.onmousedown = mouseDown;
document.onmouseup = mouseUp;
document.onmousemove = mouseMove;

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

/*
 var html = document.documentElement;
 var body = document.body;
 var table = document.getElementById('dynamic');
 
 
 
 for (var a = 0; a < table.rows[0].cells.length; ++a) {
 var cell = table.rows[0].cells[a];
 
 cell.onmousedown = function(event) {
 var mouse = mouseCoords(event);
 var startX = mouse.x;
 document.onmousemove = function(event) {
 var mouse = mouseCoords(event);
 var moveX = mouse.x - startX;
 
 if (moveX > 10) {
 swapColumns(table, 2, 1);   
 }
 
 };
 };
 }
 
 for (var j = 0; j < table.rows.length; j++) { // rows
 var row = this.table.rows[j];
 
 
 
 // vertical sliders        
 if (j !== 0) {
 row.cells[0].innerHTML = row.cells[0].innerHTML + "<div id='dy-" + j + "' class='dy'></div>";
 var dy = document.getElementById('dy-' + j);
 
 dy.onmousedown = function(event) {
 var startY = event.clientY + (html.scrollTop || (body && body.scrollTop) || 0) - (html.clientTop || 0);
 
 var posY = this.id.split("-");
 posY = posY[1];
 
 var originalHeight = table.rows[posY].cells[0].clientHeight;
 
 document.onmousemove = function(event) {
 var mouseY = event.clientY + (html.scrollTop || (body && body.scrollTop) || 0) - (html.clientTop || 0);
 var moveY = mouseY - startY;
 var newHeight = moveY + originalHeight;
 
 for (var i = 0; i < table.rows[posY].cells.length; ++i) {
 var cell = table.rows[posY].cells[i];
 cell.style.height = newHeight + 'px';
 }
 
 table.rows[posY].cells[0].clientHeight = newHeight;
 };
 };
 }
 
 
 
 // horizontal sliders
 for (var i = 0; i < row.cells.length; i++) { // columns        
 var cell = row.cells[i];
 
 if (j === 0 && i !== 0) {
 cell.innerHTML = "<div id='dx-" + i + "' class='dx'></div>" + cell.innerHTML;
 var dx = document.getElementById('dx-' + i);
 
 dx.onmousedown = function(event) {
 var startX = event.clientX + (html.scrollLeft || (body && body.scrollLeft) || 0) - (html.clientLeft || 0);
 
 var posX = this.id.split("-");
 posX = posX[1];
 
 var originalWidth = table.rows[0].cells[posX].clientWidth;
 
 document.onmousemove = function(event) {
 var mouseX = event.clientX + (html.scrollLeft || (body && body.scrollLeft) || 0) - (html.clientLeft || 0);
 var moveX = mouseX - startX;
 var newWidth = moveX + originalWidth;
 
 for (var j = 0; j < table.rows.length; ++j) {
 var cell = table.rows[j].cells[posX];
 cell.style.width = newWidth + 'px';
 }
 table.rows[0].cells[posX].clientWidth = newWidth;
 
 };
 };
 }
 }
 }*/
var html = document.documentElement;
var body = document.body;
var table = document.getElementById('dynamic');

for (var j = 0; j < table.rows.length; j++) { // rows
    var row = this.table.rows[j];
    
    // draw sliders
    
    // vertical sliders        
    row.cells[0].innerHTML = "<div id='dy-" + j + "' class='dy'></div>" + row.cells[0].innerHTML;
    var dy = document.getElementById('dy-' + j);
    
    for (var i = 0; i < row.cells.length; i++) { // columns        
        var cell = row.cells[i];
        
        // horizontal sliders
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
    
    document.onmouseup = function() {
        document.onmousemove = null;
    }
}
    
    
    
    
/*
    var draggableX = document.getElementById('dx-' + i + "-" + j);        
    
    var draggableY = document.getElementById('dy-' + i + "-" + j);
   
    draggableX.onmousedown = function(event) {
        var startX = event.clientX + (html.scrollLeft || (body && body.scrollLeft) || 0) - (html.clientLeft || 0);
        var posX = this.id;
        posX = posX.split("-");
        posX = posX[1];
        
        var originalWidth = parseInt(table.rows[0].cells[posX-1].clientWidth, 10);                
                        
        document.onmousemove = function(event) {
            var mouseX = event.clientX + (html.scrollLeft || (body && body.scrollLeft) || 0) - (html.clientLeft || 0);        
            var moveX = mouseX - startX;            
            
            var newWidth = moveX + originalWidth;
            
            for (var j = 0; j < table.rows.length; ++j) {                                                
                
                var cell = table.rows[j].cells[posX-1];                                
                cell.style.width = newWidth + 'px';
            }

        }
    }   
    
    draggableY.onmousedown = function(event) {        
        var startY = event.clientY + (html.scrollTop || (body && body.scrollTop) || 0) - (html.clientTop || 0);        
        var posY, posX;
        posY = this.id.split("-");
        posY = posY[2];
        posX = this.id.split("-");
        posX = posX[1];
        
        var originalHeight = parseInt(table.rows[posY].cells[posX-1].clientHeight, 10);                
        var e = document.getElementById("draggableY-" + posX + "-" + (posY-1));
                        
        document.onmousemove = function(event) {
            var mouseY = event.clientY + (html.scrollTop || (body && body.scrollTop) || 0) - (html.clientTop || 0);                   
            var moveY = mouseY - startY;                                                                                
            var newHeight = moveY + originalHeight;
                                    
            
            e.style.marginTop = -(moveY / 2 + 5) + 'px';
            
            for (var j = 0; j < table.rows[posY].cells.length; ++j) {                                                                
                var cell = table.rows[posY-1].cells[j];                                
                cell.style.height = newHeight + 'px';
            }

        }
    }   

    document.onmouseup = function() {
        document.onmousemove = null;
    }*/


     


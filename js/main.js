var html = document.documentElement;
var body = document.body;
var table = document.getElementById('dynamic');

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
    
    document.onmouseup = function() {
        document.onmousemove = null;
    }
}
    
/// <reference path="grid.ts" />
/// <reference path="general.ts" />
/// <reference path="gui.ts" />

namespace Thermo {
    function processCell(i : number, j : number, c : Array<Array<Grid.Cell>>) {
        var temperature = Grid.content[i][j].temperature;
        var adj = Grid.adjacent(i,j);
        var adjLow = adj.filter(function (p) {
            return Grid.content[p[0]][p[1]].temperature < temperature; 
        });
        var l = adjLow.length;
        var adjLowT = new Array<number>(l);
        
        var z; // counter
        
        for (z = 0; z < l; z++) {
                var p = adjLow[z];
                var x = p[0];
                var y = p[1];
                
                adjLowT[z] = Grid.content[x][y].temperature;
        }
        
        if (l > 0) {
            var s = arrSum(adjLowT);
            var k = (l * temperature - s) / (l + 1);
            
            var deltas = new Array<number>(l);
            for (z = 0; z < l; z++) {
                var x = adjLow[z][0];
                var y = adjLow[z][1];
                var rate;
                if (Grid.content[x][y].type != Grid.content[i][j].type)
                    rate = Grid.content[x][y].transferRate * Grid.content[i][j].transferRate;
                else rate = Grid.content[x][y].transferRate;
                deltas[z] = mathTrunc((temperature - k - adjLowT[z]) * rate);
            }

            for (z = 0; z < l; z++) {
                var p = adjLow[z];
                var x = p[0];
                var y = p[1];
                
                c[x][y].temperature += deltas[z];
                if (Grid.content[x][y].temperature > temperature) alert("wtf");
            }

            c[i][j].temperature -= arrSum(deltas);
        }
    }
    
    export function dissipate() {
        var i, j;
        
        var newContent : Array<Array<Grid.Cell>> = new Array(Grid.width);
        // copy old content
        for (i = 0; i < Grid.width; i++) {
            newContent[i] = new Array(Grid.height);
            
            for (j = 0; j < Grid.height; j++) {
                newContent[i][j] = (<any>Object).assign({}, Grid.content[i][j]);
            }
        }
  
        Grid.map(function (i, j, cell) {
            processCell(i, j, newContent);
        });
                
        Grid.content = newContent;

    }
    
    export function filter(x, y, i, j) {
        var GRID_STEP = GUI.GRID_STEP;
        if (Grid.hasPoint(x, y)) {
 
            var temperature = Grid.content[x][y].temperature;
            var a = Math.abs(temperature / 255);
                
            var red = 0;
            var blue = 0;
                
            if (temperature > 0) 
                red = 255;
            else 
                blue = 255;
                    
            GUI.ctx.fillStyle = "rgba(" + red + "," + 0 + "," + blue + "," + a + ")";
            GUI.ctx.fillRect(i * GRID_STEP, j * GRID_STEP, GRID_STEP, GRID_STEP);
        }
    }
}
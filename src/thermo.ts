/// <reference path="grid.ts" />
/// <reference path="general.ts" />
/// <reference path="gui.ts" />

namespace Thermo {
    function processCell(i : number, j : number, c : Array<Array<Grid.Cell>>) {
        // how it works:
        // for a given grid cell with heat value n
        // inspect the adjacent cells (up,down,left,right)
        // calculate k in a way so after heat transfer the heat values
        // of the given cell and adjacent cells are all equal to n-k
        // apply multipliers for heat transfer rates and air resistance
        // perform heat transfer (on a new heatmap, using the old one's info)
        var cellHeat = Grid.content[i][j].heat;
        var adj = Grid.adjacent(i,j);
        var adjLow = adj.filter(function (p) {
            return Grid.content[p[0]][p[1]].heat < cellHeat; 
        });
        var l = adjLow.length;
        var adjLowHeat = new Array<number>(l);
        
        var z; // counter
        
        for (z = 0; z < l; z++) {
                var p = adjLow[z];
                var x = p[0];
                var y = p[1];
                
                adjLowHeat[z] = Grid.content[x][y].heat;
        }
        
        if (l > 0 && cellHeat > -255) {
            var s = arrSum(adjLowHeat);
            var k = (l * cellHeat - s) / (l + 1);
            
            var deltas = new Array<number>(l);
            for (z = 0; z < l; z++) {
                var x = adjLow[z][0];
                var y = adjLow[z][1];
                var rate = (Grid.content[x][y].transferRate + Grid.content[i][j].transferRate)/2;
                if ((Grid.content[x][y].type == 0) !== (Grid.content[i][j].type == 0))
                    rate *= 0.1;
                deltas[z] = Math.floor((cellHeat - k - adjLowHeat[z]) * rate);
            }

            for (z = 0; z < l; z++) {
                var p = adjLow[z];
                var x = p[0];
                var y = p[1];
                
                c[x][y].heat += deltas[z];
            }

            c[i][j].heat -= arrSum(deltas);
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
            var heat = Grid.content[x][y].heat;
            var a = Math.abs(heat / 255);
                
            var red = 0;
            var blue = 0;
                
            if (heat > 0) 
                red = 255;
            else 
                blue = 255;
                    
            GUI.ctx.fillStyle = "rgba(" + red + "," + 0 + "," + blue + "," + a + ")";
            GUI.ctx.fillRect(i * GRID_STEP, j * GRID_STEP, GRID_STEP, GRID_STEP);
        }
    }
}
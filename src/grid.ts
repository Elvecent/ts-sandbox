/// <reference path="thermo.ts" />
/// <reference path="lighting.ts" />
/// <reference path="gui.ts" />
namespace Grid {
    export interface Cell {
        heat: number;
        transferRate: number;
        type: number;
        light: number;
    }
    
    export var width, height, step;
    
    export var content : Array<Array<Cell>>;
    
    export function init(w,h,s) {
        width = w;
        height = h;
        step = s;
        content = new Array<Array<Cell>>(width);
        var i, j;
        
        for (i = 0; i < width; i++) {
            content[i] = new Array<Cell>(height);
            
            for (j = 0; j < height; j++) {
                content[i][j] = {heat: 0, transferRate: 1, type: 0, light: Light.ambient};
            }
        }
    }
    
    export function update() {
        Thermo.dissipate();
        
        map(function (i, j, cell) {
            if (cell.type == 2)
                cell.heat = min(255, cell.heat + 1);
        });
        
        State.flickerFlag += 1;
        State.flickerFlag %= 10000;
    }
    
    export function map(f) {
        var i, j;
        
        for (i = 0; i < width; i++)
            for (j = 0; j < height; j++)
                f(i, j, content[i][j]);
    }
    
    export function hasPoint(x, y) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }
    
    export function draw() {
        Light.enlight(State.lightSources);
        var ctx = GUI.ctx;
        var origin = GUI.origin;
        map(function (i, j, cell) {
            var x = i + origin.x;
            var y = j + origin.y;
            ctx.fillStyle = "black";
            
            if (hasPoint(x, y)) {
                var tile = GUI.tiles[content[x][y].type];
                ctx.drawImage(tile, i * step, j * step);
                
                applyFilters(x, y, i, j);
            }
            else {
                ctx.fillRect(i * step, j * step, step, step);
            }
        });
        if (State.currentCell) {
            var curX = State.currentCell.x;
            var curY = State.currentCell.y;
            var div = GUI.currentCellDiv;
            div.textContent = "Cell under cursor: " + GUI.showCell(content[curX][curY]);
        }
    }
    
    export function adjacent(i : number, j : number) : Array<[number,number]> {
        var res = [];
        if (i > 0)
            res.push([i-1,j]);
        if (i < this.width - 1)
            res.push([i+1,j]);
        if (j > 0)
            res.push([i,j-1]);
        if (j < this.height - 1)
            res.push([i,j+1]);
        return res;
    }
    
    export function resetLight() {
        map(function (i, j, cell) {
            cell.light = Light.ambient;
        });
    }
    
    function applyFilters(x, y, i, j) {
        if (State.showLight) 
            Light.filter(x, y, i, j);
                    
        if (State.showHeat) 
            Thermo.filter(x, y, i, j);
    }
}
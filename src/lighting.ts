/// <reference path="grid.ts" />
/// <reference path="general.ts" />
/// <reference path="gui.ts" />
namespace Light {
    export var heatBarrier = 80;
    export var ambient = 30;
    
    export class LightSource {
        constructor (public x : number, public y : number, public power : number, public flickerRate) {}
    }
    
    function getSquare(x : number, y : number) : Array<Point> {
        var res : Array<Point> = new Array<Point>();
        var i, j;
        for (i = max(0,x - 8); i < min(Grid.width,x + 9); i++)
            for (j = max(0,y - 8); j < min(Grid.height,y + 9); j++) {
                res.push({x: i, y: j});
            }
        
        return res;
    }
    
    function collision(a : Point, b : Point) : Array<Point> {
        var res = [];
        var line = calcStraightLine(a,b);
        
        line.map(function (p) {
            if (Grid.content[p.x][p.y].type == 1)
                res.push(p);
        });
        
        return res;
    }
    
    export function enlight(sources : Array<LightSource>) : void {
        Grid.resetLight();
        sources.map(function (ls) {
            var sq = getSquare(ls.x, ls.y);
            var s;
            for (s = 0; s < sq.length; s++) {
                var x = sq[s].x;
                var y = sq[s].y;
                var delta = Math.floor(200 * ls.power / dist(x,y,ls.x,ls.y));
                var col = collision(sq[s],<Point>ls);
                if (col.length == 0 || (Grid.content[x][y].type == 1 && col.length == 1)) {
                    Grid.content[x][y].light = min(255, Grid.content[x][y].light + delta);
                }
            }
        });
        flicker(sources);
    }
    
    export function filter(x, y, i, j) {
        var ctx = GUI.ctx;
        var step = Grid.step;
        var cell = Grid.content[x][y];
        var light = cell.light;
        
        if (cell.temperature > Light.heatBarrier)
            light = min(255, light + cell.temperature - Light.heatBarrier);
        
        var a = (255 - light)/255;
                    
        ctx.fillStyle = "rgba(0,0,0," + a + ")";
        ctx.fillRect(i * step, j * step, step, step);
    }
    
    export function hasSource(sources, x, y) {
        return sources.some(function (ls) {
            return ls.x == x && ls.y == y;
        });
    }
    
    function sourceIndex(sources, x, y) {
        var i;
        
        for (i = 0; i < sources.length; i++)
            if (sources[i].x == x && sources[i].y == y)
                return i;
        return -1;
    }
    
    export function removeSource(sources, x, y) {
        var i = sourceIndex(sources, x, y);
        
        sources.splice(i, 1);
    }
    
    export function flicker(sources) {
        sources.map(function (ls) {
            var rate = ls.flickerRate;
            var now = State.flickerFlag;
            if (rate > 0 && now % rate == 0) {
                ls.power = 180 - ls.power;
            }
        });
    }
}
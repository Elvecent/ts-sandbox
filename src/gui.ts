/// <reference path="events.ts" />
/// <reference path="grid.ts" />
/// <reference path="tool_panel.ts" />
namespace GUI {
    export var GRID_STEP = 20;
    export var updateRate = 50;
    
    var gridWidth = Math.floor(window.innerWidth / (GRID_STEP * 1.1));
    var gridHeight = Math.floor(window.innerHeight / (GRID_STEP * 1.1));
    
    export var origin = {x: 0, y: 0};

    export var canvas = <HTMLCanvasElement> document.getElementById("canvas");
    export var ctx = canvas.getContext("2d");
    
    export var tiles = [new Image(GRID_STEP,GRID_STEP), 
                        new Image(GRID_STEP,GRID_STEP),
                        new Image(GRID_STEP,GRID_STEP)];
    
    export function init() {
        canvas.width = gridWidth * GRID_STEP;
        canvas.height = gridHeight * GRID_STEP;
        ctx.font = "14px Arial";
        //ctx.globalCompositeOperation = "source-over";
        
        tiles[2].src = "torch.jpg"
        tiles[1].src = "stone.jpg";
        tiles[0].src = "air.jpg";
        
        Grid.init(gridWidth,gridHeight,GRID_STEP);
        
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        window.onkeydown = Events.onKeyDown;
        canvas.addEventListener("mousedown", Events.onMouseDown);
        canvas.addEventListener("mouseup", Events.onMouseUp);
        canvas.addEventListener("mousemove", Events.onMouseMove);
    }
    
    export function drawGrid() {
        Grid.draw();
    }
    
    export function drawToolPanel() {
        ToolPanel.draw();
    }
}

GUI.init();
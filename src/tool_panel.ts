/// <reference path="state.ts" />
/// <reference path="gui.ts" />
namespace ToolPanel {
    export var width = 70;
    var drawn = false;
    
    interface Button {
        tool : string;
        color: string;
    }

    var buttons : Array<Button> = [{tool: "heat", color: "red"},
                                   {tool: "cold", color: "blue"},
                                   {tool: "stone", color: "black"},
                                   {tool: "air", color: "white"},
                                   {tool: "torch", color: "yellow"}];
    
    export function draw() {
        var ctx = GUI.ctx;
        
        if (State.showToolPanel) {
            ctx.fillStyle = "grey";
            ctx.fillRect(GUI.canvas.width - width, 0, width, GUI.canvas.height);
            
            drawButtons();
            drawn = true;
        } 
        else {
            if (drawn) {
                GUI.drawGrid();
                drawn = false;
            }
        }
    }
    
    export function buttonAt(x, y) : number {
        var i;
        
        var res = -1;
        
        for (i = 0; i < buttons.length; i++) {
            var p = buttonCoords(i);
            
            if (x >= p.x && x < p.x + 20 && y >= p.y && y < p.y + 20)
                res = i;
        }
        
        return res;
    }
    
    function drawButtons() {
        var ctx = GUI.ctx;
        ctx.strokeStyle = "lightgreen";
        ctx.lineWidth = 2;
        var i;
        
        for (i = 0; i < buttons.length; i++) {
            var p = buttonCoords(i);
            
            ctx.fillStyle = buttons[i].color;
            ctx.fillRect(p.x, p.y, 20, 20);
            
            if (i == State.toolButton)
                ctx.strokeRect(p.x, p.y, 20, 20);
        }
    }
    
    function buttonCoords(num) {
        var x = num % 2;
        var y = Math.floor(num/2);
            
        var offset = GUI.canvas.width - width;

        return {x: 10 + offset + x * 30, y: 10 + y * 30};
    }
    
    export function handleButtons(x, y) {
        var n = buttonAt(x, y);
        
        if (n >= 0) {
            State.tool = buttons[n].tool;
            State.toolButton = n;
        }
    }
    
    export function xOnPanel(x) {
        return x > GUI.canvas.width - width;
    }
}
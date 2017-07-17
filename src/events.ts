/// <reference path="state.ts" />
/// <reference path="gui.ts" />
/// <reference path="lighting.ts" />
/// <reference path="tool_panel.ts" />
namespace Events {
    export var onKeyDown = throttle(function (e) {
        switch (e.keyCode) {
            case 87: // w
                GUI.origin.y -= 1;
                break;
                
            case 65: // a
                GUI.origin.x -= 1;
                break;
                
            case 83: // s
                GUI.origin.y += 1;
                break;
            
            case 68: // d
                GUI.origin.x += 1;
                break;
                
            case 72: // h
                State.showHeat = !State.showHeat;
                break;
                
            case 76: // l
                State.showLight = !State.showLight;
                break;
                
            case 32: // space
                State.simulate = !State.simulate;
                
                if (State.simulate)
                    updateGrid();
                break;
            
            default:
        }
        
        GUI.drawGrid();
        GUI.drawToolPanel();
    }, 50);
    
    export function onMouseDown(e) {
        State.mouseDown = true;
        handleMouseInput(e);
    }
    
    export function onMouseUp(e) {
        State.mouseDown = false;
    }
    
    export function onMouseMove(e) {
        handleMouseInput(e);
    }
    
    function handleMouseInput(e) {
        var x = e.pageX - GUI.canvas.offsetLeft;
        var y = e.pageY - GUI.canvas.offsetTop;
        
        var i = Math.floor(x / GUI.GRID_STEP) + GUI.origin.x;
        var j = Math.floor(y / GUI.GRID_STEP) + GUI.origin.y;
            
        if (State.mouseDown) {
            
            if (ToolPanel.xOnPanel(x) && State.showToolPanel)
                ToolPanel.handleButtons(x, y);
            else 
                handleToolUse(i, j);
        }
        else {
            if (ToolPanel.xOnPanel(x))
                State.showToolPanel = true;
            else  {
                var u = i - GUI.origin.x;
                var v = j - GUI.origin.y;
                State.showToolPanel = false;
                State.currentCell = {x: u, y: v};
                GUI.currentCellDiv.textContent = "Cell under cursor: " + GUI.showCell(u, v);
            }
        }
        
        GUI.drawToolPanel();   
    }
    
    function handleToolUse(x, y) {
        if (Grid.hasPoint(x, y)) {
            var i = x - GUI.origin.x;
            var j = y - GUI.origin.y;
            
            var ctx = GUI.ctx;
            var GRID_STEP = GUI.GRID_STEP;
            var cell = Grid.content[x][y];
            switch (State.tool) {
                case "heat":
                    cell.temperature = 255;
                    ctx.fillStyle = "red";
                    ctx.fillRect(i * GRID_STEP, j * GRID_STEP, GRID_STEP, GRID_STEP);
                    break;
                
                case "cold":
                    cell.temperature = -255;
                    ctx.fillStyle = "blue";
                    ctx.fillRect(i * GRID_STEP, j * GRID_STEP, GRID_STEP, GRID_STEP);
                    break;
                    
                case "stone":
                    Grid.newStoneCell(cell);
                    ctx.drawImage(GUI.tiles[1], i * GRID_STEP, j * GRID_STEP);
                    break;
                    
                case "torch":
                    Grid.newTorchCell(cell);
                    ctx.drawImage(GUI.tiles[2], i * GRID_STEP, j * GRID_STEP);
                    if (!Light.hasSource(State.lightSources, x, y))
                        State.lightSources.push(new Light.LightSource(x, y, 100, 5));
                    break;
                    
                case "air":
                    Grid.newAirCell(cell);
                    if (Light.hasSource(State.lightSources, x, y))
                        Light.removeSource(State.lightSources, x, y);
                    ctx.drawImage(GUI.tiles[0], i * GRID_STEP, j * GRID_STEP);
                    break;
                
                default:
            }
        }
    }
    
    function updateGrid() {
        GUI.ctx.fillRect(0, 0, GUI.canvas.width, GUI.canvas.height);
        Grid.update();
        Grid.draw();
        GUI.drawToolPanel();
        if (State.simulate) 
            setTimeout(updateGrid, GUI.updateRate);
    }
    
    export function throttle(eventHandler, interval) {
        var lastCalled = 0;
        
        return function (e) {
            var now = Date.now();
            if (now > lastCalled + interval) {
                eventHandler(e);
                lastCalled = now;
            }
        }
    }
}
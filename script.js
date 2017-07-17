function arrSum(arr) {
    var i;
    var res = 0;
    for (i = 0; i < arr.length; i++)
        res += arr[i];
    return res;
}
function max(x, y) {
    if (x > y)
        return x;
    return y;
}
function min(x, y) {
    if (x > y)
        return y;
    return x;
}
function dist(x, y, u, v) {
    return Math.pow(Math.pow(x - u, 2) + Math.pow(y - v, 2), 2);
}
function calcStraightLine(startCoordinates, endCoordinates) {
    var coordinatesArray = new Array();
    var x1 = startCoordinates.x;
    var y1 = startCoordinates.y;
    var x2 = endCoordinates.x;
    var y2 = endCoordinates.y;
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    coordinatesArray.push({ y: y1, x: x1 });
    while (!((x1 == x2) && (y1 == y2))) {
        var e2 = err << 1;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
        coordinatesArray.push({ y: y1, x: x1 });
    }
    return coordinatesArray;
}
function mathTrunc(x) {
    return (x < 0 ? Math.ceil(x) : Math.floor(x));
}
/// <reference path="grid.ts" />
/// <reference path="general.ts" />
/// <reference path="gui.ts" />
var Thermo;
(function (Thermo) {
    function processCell(i, j, c) {
        var temperature = Grid.content[i][j].temperature;
        var adj = Grid.adjacent(i, j);
        var adjLow = adj.filter(function (p) {
            return Grid.content[p[0]][p[1]].temperature < temperature;
        });
        var l = adjLow.length;
        var adjLowT = new Array(l);
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
            var deltas = new Array(l);
            for (z = 0; z < l; z++) {
                var x = adjLow[z][0];
                var y = adjLow[z][1];
                var rate;
                if (Grid.content[x][y].type != Grid.content[i][j].type)
                    rate = Grid.content[x][y].transferRate * Grid.content[i][j].transferRate;
                else
                    rate = Grid.content[x][y].transferRate;
                deltas[z] = mathTrunc((temperature - k - adjLowT[z]) * rate);
            }
            for (z = 0; z < l; z++) {
                var p = adjLow[z];
                var x = p[0];
                var y = p[1];
                c[x][y].temperature += deltas[z];
                if (Grid.content[x][y].temperature > temperature)
                    alert("wtf");
            }
            c[i][j].temperature -= arrSum(deltas);
        }
    }
    function dissipate() {
        var i, j;
        var newContent = new Array(Grid.width);
        // copy old content
        for (i = 0; i < Grid.width; i++) {
            newContent[i] = new Array(Grid.height);
            for (j = 0; j < Grid.height; j++) {
                newContent[i][j] = Object.assign({}, Grid.content[i][j]);
            }
        }
        Grid.map(function (i, j, cell) {
            processCell(i, j, newContent);
        });
        Grid.content = newContent;
    }
    Thermo.dissipate = dissipate;
    function filter(x, y, i, j) {
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
    Thermo.filter = filter;
})(Thermo || (Thermo = {}));
/// <reference path="thermo.ts" />
/// <reference path="lighting.ts" />
/// <reference path="gui.ts" />
var Grid;
(function (Grid) {
    function init(w, h, s) {
        Grid.width = w;
        Grid.height = h;
        Grid.step = s;
        Grid.content = new Array(Grid.width);
        var i, j;
        for (i = 0; i < Grid.width; i++) {
            Grid.content[i] = new Array(Grid.height);
            for (j = 0; j < Grid.height; j++) {
                Grid.content[i][j] = { temperature: 0,
                    transferRate: 0.5,
                    type: 0,
                    light: Light.ambient };
            }
        }
    }
    Grid.init = init;
    function newAirCell(cell) {
        cell.temperature = 0;
        cell.transferRate = 0.5;
        cell.type = 0;
        cell.light = Light.ambient;
    }
    Grid.newAirCell = newAirCell;
    function newStoneCell(cell) {
        cell.temperature = 0;
        cell.transferRate = 0.4;
        cell.type = 1;
        cell.light = Light.ambient;
    }
    Grid.newStoneCell = newStoneCell;
    function newTorchCell(cell) {
        cell.temperature = 0;
        cell.transferRate = 0.4;
        cell.type = 2;
        cell.light = Light.ambient;
    }
    Grid.newTorchCell = newTorchCell;
    function update() {
        Thermo.dissipate();
        map(function (i, j, cell) {
            if (cell.type == 2)
                cell.temperature = min(255, cell.temperature + 1);
        });
        State.flickerFlag += 1;
        State.flickerFlag %= 10000;
    }
    Grid.update = update;
    function map(f) {
        var i, j;
        for (i = 0; i < Grid.width; i++)
            for (j = 0; j < Grid.height; j++)
                f(i, j, Grid.content[i][j]);
    }
    Grid.map = map;
    function hasPoint(x, y) {
        return x >= 0 && x < Grid.width && y >= 0 && y < Grid.height;
    }
    Grid.hasPoint = hasPoint;
    function draw() {
        Light.enlight(State.lightSources);
        var ctx = GUI.ctx;
        var origin = GUI.origin;
        map(function (i, j, cell) {
            var x = i + origin.x;
            var y = j + origin.y;
            ctx.fillStyle = "black";
            if (hasPoint(x, y)) {
                var tile = GUI.tiles[Grid.content[x][y].type];
                ctx.drawImage(tile, i * Grid.step, j * Grid.step);
                applyFilters(x, y, i, j);
            }
            else {
                ctx.fillRect(i * Grid.step, j * Grid.step, Grid.step, Grid.step);
            }
        });
        if (State.currentCell) {
            var curX = State.currentCell.x;
            var curY = State.currentCell.y;
            var div = GUI.currentCellDiv;
            div.textContent = "Cell under cursor: " + GUI.showCell(curX, curY);
        }
    }
    Grid.draw = draw;
    function adjacent(i, j) {
        var res = [];
        if (i > 0)
            res.push([i - 1, j]);
        if (i < Grid.width - 1)
            res.push([i + 1, j]);
        if (j > 0)
            res.push([i, j - 1]);
        if (j < Grid.height - 1)
            res.push([i, j + 1]);
        return res;
    }
    Grid.adjacent = adjacent;
    function resetLight() {
        map(function (i, j, cell) {
            cell.light = Light.ambient;
        });
    }
    Grid.resetLight = resetLight;
    function applyFilters(x, y, i, j) {
        if (State.showLight)
            Light.filter(x, y, i, j);
        if (State.showHeat)
            Thermo.filter(x, y, i, j);
    }
})(Grid || (Grid = {}));
/// <reference path="grid.ts" />
/// <reference path="general.ts" />
/// <reference path="gui.ts" />
var Light;
(function (Light) {
    Light.heatBarrier = 80;
    Light.ambient = 30;
    var LightSource = (function () {
        function LightSource(x, y, power, flickerRate) {
            this.x = x;
            this.y = y;
            this.power = power;
            this.flickerRate = flickerRate;
        }
        return LightSource;
    }());
    Light.LightSource = LightSource;
    function getSquare(x, y) {
        var res = new Array();
        var i, j;
        for (i = max(0, x - 8); i < min(Grid.width, x + 9); i++)
            for (j = max(0, y - 8); j < min(Grid.height, y + 9); j++) {
                res.push({ x: i, y: j });
            }
        return res;
    }
    function collision(a, b) {
        var res = [];
        var line = calcStraightLine(a, b);
        line.map(function (p) {
            if (Grid.content[p.x][p.y].type == 1)
                res.push(p);
        });
        return res;
    }
    function enlight(sources) {
        Grid.resetLight();
        sources.map(function (ls) {
            var sq = getSquare(ls.x, ls.y);
            var s;
            for (s = 0; s < sq.length; s++) {
                var x = sq[s].x;
                var y = sq[s].y;
                var delta = Math.floor(200 * ls.power / dist(x, y, ls.x, ls.y));
                var col = collision(sq[s], ls);
                if (col.length == 0 || (Grid.content[x][y].type == 1 && col.length == 1)) {
                    Grid.content[x][y].light = min(255, Grid.content[x][y].light + delta);
                }
            }
        });
        flicker(sources);
    }
    Light.enlight = enlight;
    function filter(x, y, i, j) {
        var ctx = GUI.ctx;
        var step = Grid.step;
        var cell = Grid.content[x][y];
        var light = cell.light;
        if (cell.temperature > Light.heatBarrier)
            light = min(255, light + cell.temperature - Light.heatBarrier);
        var a = (255 - light) / 255;
        ctx.fillStyle = "rgba(0,0,0," + a + ")";
        ctx.fillRect(i * step, j * step, step, step);
    }
    Light.filter = filter;
    function hasSource(sources, x, y) {
        return sources.some(function (ls) {
            return ls.x == x && ls.y == y;
        });
    }
    Light.hasSource = hasSource;
    function sourceIndex(sources, x, y) {
        var i;
        for (i = 0; i < sources.length; i++)
            if (sources[i].x == x && sources[i].y == y)
                return i;
        return -1;
    }
    function removeSource(sources, x, y) {
        var i = sourceIndex(sources, x, y);
        sources.splice(i, 1);
    }
    Light.removeSource = removeSource;
    function flicker(sources) {
        sources.map(function (ls) {
            var rate = ls.flickerRate;
            var now = State.flickerFlag;
            if (rate > 0 && now % rate == 0) {
                ls.power = 180 - ls.power;
            }
        });
    }
    Light.flicker = flicker;
})(Light || (Light = {}));
/// <reference path="lighting.ts" />
var State;
(function (State) {
    State.mouseDown = false;
    State.showToolPanel = true;
    State.tool = "heat";
    State.toolButton = 0;
    State.showHeat = true;
    State.showLight = true;
    State.simulate = false;
    State.lightSources = [];
    State.flickerFlag = 0;
})(State || (State = {}));
/// <reference path="state.ts" />
/// <reference path="gui.ts" />
var ToolPanel;
(function (ToolPanel) {
    ToolPanel.width = 70;
    var drawn = false;
    var buttons = [{ tool: "heat", color: "red" },
        { tool: "cold", color: "blue" },
        { tool: "stone", color: "black" },
        { tool: "air", color: "white" },
        { tool: "torch", color: "yellow" }];
    function draw() {
        var ctx = GUI.ctx;
        if (State.showToolPanel) {
            ctx.fillStyle = "grey";
            ctx.fillRect(GUI.canvas.width - ToolPanel.width, 0, ToolPanel.width, GUI.canvas.height);
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
    ToolPanel.draw = draw;
    function buttonAt(x, y) {
        var i;
        var res = -1;
        for (i = 0; i < buttons.length; i++) {
            var p = buttonCoords(i);
            if (x >= p.x && x < p.x + 20 && y >= p.y && y < p.y + 20)
                res = i;
        }
        return res;
    }
    ToolPanel.buttonAt = buttonAt;
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
        var y = Math.floor(num / 2);
        var offset = GUI.canvas.width - ToolPanel.width;
        return { x: 10 + offset + x * 30, y: 10 + y * 30 };
    }
    function handleButtons(x, y) {
        var n = buttonAt(x, y);
        if (n >= 0) {
            State.tool = buttons[n].tool;
            State.toolButton = n;
        }
    }
    ToolPanel.handleButtons = handleButtons;
    function xOnPanel(x) {
        return x > GUI.canvas.width - ToolPanel.width;
    }
    ToolPanel.xOnPanel = xOnPanel;
})(ToolPanel || (ToolPanel = {}));
/// <reference path="state.ts" />
/// <reference path="gui.ts" />
/// <reference path="lighting.ts" />
/// <reference path="tool_panel.ts" />
var Events;
(function (Events) {
    Events.onKeyDown = throttle(function (e) {
        switch (e.keyCode) {
            case 87:
                GUI.origin.y -= 1;
                break;
            case 65:
                GUI.origin.x -= 1;
                break;
            case 83:
                GUI.origin.y += 1;
                break;
            case 68:
                GUI.origin.x += 1;
                break;
            case 72:
                State.showHeat = !State.showHeat;
                break;
            case 76:
                State.showLight = !State.showLight;
                break;
            case 32:
                State.simulate = !State.simulate;
                if (State.simulate)
                    updateGrid();
                break;
            default:
        }
        GUI.drawGrid();
        GUI.drawToolPanel();
    }, 50);
    function onMouseDown(e) {
        State.mouseDown = true;
        handleMouseInput(e);
    }
    Events.onMouseDown = onMouseDown;
    function onMouseUp(e) {
        State.mouseDown = false;
    }
    Events.onMouseUp = onMouseUp;
    function onMouseMove(e) {
        handleMouseInput(e);
    }
    Events.onMouseMove = onMouseMove;
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
            else {
                var u = i - GUI.origin.x;
                var v = j - GUI.origin.y;
                State.showToolPanel = false;
                State.currentCell = { x: u, y: v };
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
    function throttle(eventHandler, interval) {
        var lastCalled = 0;
        return function (e) {
            var now = Date.now();
            if (now > lastCalled + interval) {
                eventHandler(e);
                lastCalled = now;
            }
        };
    }
    Events.throttle = throttle;
})(Events || (Events = {}));
/// <reference path="events.ts" />
/// <reference path="grid.ts" />
/// <reference path="tool_panel.ts" />
var GUI;
(function (GUI) {
    GUI.GRID_STEP = 20;
    GUI.updateRate = 100;
    var gridWidth = Math.floor(window.innerWidth / (GUI.GRID_STEP * 1.1));
    var gridHeight = Math.floor(window.innerHeight / (GUI.GRID_STEP * 1.1));
    GUI.origin = { x: 0, y: 0 };
    GUI.canvas = document.getElementById("canvas");
    GUI.ctx = GUI.canvas.getContext("2d");
    GUI.currentCellDiv = document.getElementById("currentCellDiv");
    GUI.tiles = [new Image(GUI.GRID_STEP, GUI.GRID_STEP),
        new Image(GUI.GRID_STEP, GUI.GRID_STEP),
        new Image(GUI.GRID_STEP, GUI.GRID_STEP)];
    function init() {
        GUI.canvas.width = gridWidth * GUI.GRID_STEP;
        GUI.canvas.height = gridHeight * GUI.GRID_STEP;
        GUI.ctx.font = "14px Arial";
        //ctx.globalCompositeOperation = "source-over";
        GUI.tiles[2].src = "torch.jpg";
        GUI.tiles[1].src = "stone.jpg";
        GUI.tiles[0].src = "air.jpg";
        Grid.init(gridWidth, gridHeight, GUI.GRID_STEP);
        GUI.ctx.fillRect(0, 0, GUI.canvas.width, GUI.canvas.height);
        drawGrid();
        drawToolPanel();
        window.onkeydown = Events.onKeyDown;
        GUI.canvas.addEventListener("mousedown", Events.onMouseDown);
        GUI.canvas.addEventListener("mouseup", Events.onMouseUp);
        GUI.canvas.addEventListener("mousemove", Events.onMouseMove);
    }
    GUI.init = init;
    function drawGrid() {
        Grid.draw();
    }
    GUI.drawGrid = drawGrid;
    function drawToolPanel() {
        ToolPanel.draw();
    }
    GUI.drawToolPanel = drawToolPanel;
    function showCell(x, y) {
        var cell = Grid.content[x][y];
        var res = "(" + x + "," + y + ") ";
        res += "temperature: " + cell.temperature;
        res += " light: " + cell.light;
        res += " type: " + cell.type;
        return res;
    }
    GUI.showCell = showCell;
})(GUI || (GUI = {}));
GUI.init();

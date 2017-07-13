/// <reference path="lighting.ts" />
namespace State {
    export var mouseDown = false;
    export var showToolPanel = false;
    export var tool = "heat";
    export var toolButton = 0;
    export var showHeat = true;
    export var showLight = true;
    export var simulate = false;
    export var lightSources : Array<Light.LightSource> = [];
    export var flickerFlag = 0;
}
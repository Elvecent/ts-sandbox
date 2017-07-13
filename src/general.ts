interface Point {
    x : number;
    y : number;
}

function arrSum (arr : Array<number>) : number {
    var i : number;
    var res : number = 0;
    
    for (i = 0; i < arr.length; i++)
        res += arr[i];
        
    return res;
}

function max(x : number, y : number) : number {
    if (x > y)
        return x;
    return y;
}

function min(x : number, y : number) : number {
    if (x > y)
        return y;
    return x;
}

function dist(x,y,u,v) : number {
    return Math.pow(Math.pow(x-u,2) + Math.pow(y-v,2),2);
}

function calcStraightLine (startCoordinates : Point, endCoordinates : Point) {
    var coordinatesArray = new Array<Point>();

    var x1 = startCoordinates.x;
    var y1 = startCoordinates.y;
    var x2 = endCoordinates.x;
    var y2 = endCoordinates.y;

    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;

    coordinatesArray.push({y: y1, x: x1});

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
    coordinatesArray.push({y: y1, x: x1});
    }
    return coordinatesArray;
}
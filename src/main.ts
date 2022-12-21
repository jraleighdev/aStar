import { Point } from "./models/point";
import { Square } from "./models/square";
import { SquareTypes } from "./models/square-types";

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
const select: HTMLSelectElement = document.getElementById('standard-select') as HTMLSelectElement;
const startButton: HTMLButtonElement = document.getElementById('startButton') as HTMLButtonElement;
const clearButton: HTMLButtonElement = document.getElementById('clearButton') as HTMLButtonElement;

const dim = 60;
const columns = 20;
const rows = 10;

const createGrid = (): Square[][] => {
    const tempArray: Square[][] = [];
    for (let i = 0; i <= rows - 1; i++) {
        const row: Square[] = [];
        for (let j = 0; j <= columns - 1; j++) {
            row.push(new Square(j, i, dim, SquareTypes.empty));
        }
        tempArray.push(row);
    }
    return tempArray;
}

const grid: Square[][] = createGrid();

const draw = () => {
    const offset = 8;
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const square = row[j];
            ctx.fillStyle = square.color;
            ctx.fillRect(square.x * dim + offset / 2, square.y * dim + offset / 2, square.dim - offset, square.dim - offset)
            ctx.strokeStyle = 'black';
            ctx.strokeRect(square.x * dim, square.y * dim, square.dim, square.dim);
            ctx.font = '16px Arial'
            ctx.strokeText(square.fCost.toString(), square.x * dim + dim / 4, square.y * dim + dim / 2)
        }
    }
}

draw();

const update = () => {
    draw();
    requestAnimationFrame(update);
}

update();

let isDragging = false;
let squareType: SquareTypes = SquareTypes.empty;

const distBetween = (point1: Point, point2: Point): number => {
    // distance between points
    const diff = Math.sqrt(
        Math.pow(point2.x - point1.x, 2) +
        Math.pow(point2.y - point1.y, 2));

    // round to one decimial point then mutiply by 10 for simple
    // fcost and hcost calcs
    return (Math.round((diff + Number.EPSILON) * 10) / 10) * 10;
}

const validNode = (p: Point): boolean => {
    return p.x >= 0 && p.x <= columns - 1 && p.y >= 0 && p.y <= rows - 1;
}

const findNearByNodes = (start: Square, end: Square, check: Square): Square[] => {
    const x = check.x;
    const y = check.y;

    const points: Point[] = [
      /*leftCenter*/  { x: x - 1, y },
      /*leftUpper*/   { x: x - 1, y: y - 1 },
      /*upper*/       { x, y: y - 1 },
      /*rightUpper*/  { x: x + 1, y: y - 1 },
      /*right*/       { x: x + 1, y },
      /*rightBottom*/ { x: x + 1, y: y + 1 },
      /*bottom*/      { x, y: y + 1 },
      /*leftBottom*/  { x: x - 1, y: y + 1 }
    ]

    const validPoints = points.filter(p => validNode(p));
    const actualNodes = validPoints.map(p => grid[p.y][p.x]);
    // const nodes = actualNodes.filter(s => !s.isClosed);

    // nodes.forEach(x => {
    //     x.hCost = distBetween(x.centerPoint, start.centerPoint);
    //     x.gCost = distBetween(x.centerPoint, end.centerPoint);
    //     x.setIsPossible();
    // });

    // const minFCost = Math.min(...nodes.map(x => x.fCost));
    // const nodeWithMin = nodes.find(x => Math.abs(minFCost - x.fCost) < .1);

    // nodeWithMin?.setType(SquareTypes.path);
    // console.log(nodeWithMin);
    return actualNodes;
}

const findNeigbors = (check: Square): Square[] => {
    const x = check.x;
    const y = check.y;

    const points: Point[] = [
      /*leftCenter*/  { x: x - 1, y },
      /*leftUpper*/   { x: x - 1, y: y - 1 },
      /*upper*/       { x, y: y - 1 },
      /*rightUpper*/  { x: x + 1, y: y - 1 },
      /*right*/       { x: x + 1, y },
      /*rightBottom*/ { x: x + 1, y: y + 1 },
      /*bottom*/      { x, y: y + 1 },
      /*leftBottom*/  { x: x - 1, y: y + 1 }
    ]

    const validPoints = points.filter(p => validNode(p));
    const actualNodes = validPoints.map(p => grid[p.y][p.x]);
    // const nodes = actualNodes.filter(s => !s.isClosed);

    // nodes.forEach(x => {
    //     x.hCost = distBetween(x.centerPoint, start.centerPoint);
    //     x.gCost = distBetween(x.centerPoint, end.centerPoint);
    //     x.setIsPossible();
    // });

    // const minFCost = Math.min(...nodes.map(x => x.fCost));
    // const nodeWithMin = nodes.find(x => Math.abs(minFCost - x.fCost) < .1);

    // nodeWithMin?.setType(SquareTypes.path);
    // console.log(nodeWithMin);
    return actualNodes;
}

const findNodeWithLowestFCost = (nodes: Square[]): Square | undefined => {
    const minFCost = Math.min(...nodes.map(x => x.fCost));
    return nodes.find(x => Math.abs(minFCost - x.fCost) < .1);
}

const flattenedGrid = (): Square[] => {
    const tempGrid: Square[] = [];
    for (let i = 0; i <= grid.length - 1; i++) {
        for (let j = 0; j <= grid[i].length - 1; j++) {
            tempGrid.push(grid[i][j]);
        }
    }
    return tempGrid;
}

const search = () => {
    const input: HTMLInputElement = document.getElementById('numberBox') as HTMLInputElement;
    const valueFromInput = parseInt(input.value);
    let start: Square | undefined;
    let end: Square | undefined;
    for (let i = 0; i <= grid.length - 1; i++) {
        for (let j = 0; j <= grid[i].length - 1; j++) {
            const square = grid[i][j];
            if (square.isStart) start = square;
            if (square.isEnd) end = square;

            if (!(square.isStart || square.isEnd || square.isWall)) {
                square.setType(SquareTypes.empty);
            }
            square.hCost = 0;
            square.gCost = 0;
        }
    }

    if (!start || !end) {
        alert("Select a start and end to begin");
        return;
    }

    let i = 0;
    const open: Square[] = [];
    const closed: Square[] = [];
    open.push(start);
    while (i < 100) {
        const currentNode = findNodeWithLowestFCost(open);
        if (!currentNode) break;
        const indexOfCurrent = open.indexOf(currentNode);
        open.splice(indexOfCurrent, 1);
        closed.push(currentNode);

        if (closed.indexOf(end) > 0) {
            console.log('yipee!')
            currentNode.setType(SquareTypes.end);
            break;
        }
        
        const neighbors = findNeigbors(currentNode);

        for (let n = 0; n <= neighbors.length - 1; n++) {
            const nBor = neighbors[n];
            if (nBor.traversable && closed.indexOf(nBor) < 0) {
                if (open.indexOf(nBor) > 0) {
                    const newG = distBetween(start.centerPoint, nBor.centerPoint);
                    nBor.gCost = newG < nBor.gCost ? newG : nBor.gCost;
                    nBor.parent = currentNode;
                } else {
                    nBor.parent = currentNode;
                    nBor.hCost = distBetween(end.centerPoint, nBor.centerPoint);
                    nBor.gCost = distBetween(start.centerPoint, nBor.centerPoint);
                    if (!nBor.isEnd) nBor.setType(SquareTypes.possiblities);
                    open.push(nBor);
                    // console.log(nBor);
                }
            }
        }
        i++;
    }
    closed.forEach(x => { 
        if (x.type === SquareTypes.possiblities) {
            x.setType(SquareTypes.path);
        }
    });
}


canvas.addEventListener('mousemove', (event: MouseEvent) => {
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length - 1; j++) {
            const square = row[j];
            if (ctx.isPointInPath(square.path, event.offsetX, event.offsetY)) {
                if (isDragging && (squareType === SquareTypes.empty || squareType === SquareTypes.wall)) {
                    square.setType(squareType);
                } else if (!isDragging && square.type == SquareTypes.empty) {
                    square.setType(SquareTypes.hover);
                }
            } else if (!square.hasValue) {
                square.setType(SquareTypes.empty);
            }
        }
    }
});

canvas.addEventListener('mousedown', (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    isDragging = true;
    squareType = parseInt(select.value);
});

canvas.addEventListener('mouseup', (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    isDragging = false;
});

canvas.addEventListener('click', (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length - 1; j++) {
            const square = row[j];
            if ((squareType === SquareTypes.start && square.type === SquareTypes.start)
                || (squareType === SquareTypes.end && square.type === SquareTypes.end)) {
                square.setType(SquareTypes.empty);
            }
            if (ctx.isPointInPath(square.path, event.offsetX, event.offsetY)) {
                square.setType(squareType);
            }
        }
    }
});

clearButton.addEventListener('click', (event: MouseEvent) => {
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length - 1; j++) {
            const square = row[j];
            square.setType(SquareTypes.empty);
        }
    }
});

startButton.addEventListener('click', (event: MouseEvent) => {
    search();
})






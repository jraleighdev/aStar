import { Point } from "./interfaces/point";
import { Node } from "./models/node";
import { NodeTypes } from "./models/node-type";

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
const select: HTMLSelectElement = document.getElementById('standard-select') as HTMLSelectElement;
const startButton: HTMLButtonElement = document.getElementById('startButton') as HTMLButtonElement;
const clearButton: HTMLButtonElement = document.getElementById('clearButton') as HTMLButtonElement;

const dim = 80;
const columns = 20;
const rows = 10;

const createGrid = (): Node[][] => {
    const tempArray: Node[][] = [];
    for (let i = 0; i <= rows - 1; i++) {
        const row: Node[] = [];
        for (let j = 0; j <= columns - 1; j++) {
            row.push(new Node(j, i, dim, NodeTypes.empty));
        }
        tempArray.push(row);
    }
    return tempArray;
}

const grid: Node[][] = createGrid();

const draw = () => {
    const offset = 8;
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const node = row[j];
            ctx.fillStyle = node.color;
            ctx.fillRect(node.x * dim + offset / 2, node.y * dim + offset / 2, node.dim - offset, node.dim - offset)
            ctx.strokeStyle = 'black';
            ctx.strokeRect(node.x * dim, node.y * dim, node.dim, node.dim);
            ctx.font = '16px Arial';
            ctx.strokeText(node.fCost.toString(), node.x * dim + dim / 2.5, node.y * dim + dim / 1.2)
            ctx.font = '16px Arial'
            ctx.strokeText(node.gCost.toString(), node.x * dim + dim / 7, node.y * dim + dim / 4)
            ctx.font = '16px Arial'
            ctx.strokeText(node.hCost.toString(), node.x * dim + dim / 1.6, node.y * dim + dim / 4)
        }
    }
}

draw();

const update = () => {
    draw();
    requestAnimationFrame(update);
}

update();

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

const findNeigbors = (check: Node): Node[] => {
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
    return actualNodes;
}

const findNodeWithLowestFCost = (nodes: Node[]): Node | undefined => {
    const minFCost = Math.min(...nodes.map(x => x.fCost));
    return nodes.find(x => Math.abs(minFCost - x.fCost) < .1);
}

const getParents = (node: Node): Node[] => {
    let currentParent = node.parent;
    const nodes: Node[] = [];
    while (currentParent) {
        nodes.push(currentParent);
        currentParent = currentParent.parent;
    }
    return nodes;
}

const search = () => {
    let start: Node | undefined;
    let end: Node | undefined;
    for (let i = 0; i <= grid.length - 1; i++) {
        for (let j = 0; j <= grid[i].length - 1; j++) {
            const node = grid[i][j];
            if (node.isStart) start = node;
            if (node.isEnd) end = node;

            if (!(node.isStart || node.isEnd || node.isWall)) {
                node.setType(NodeTypes.empty);
            }
            node.hCost = 0;
            node.gCost = 0;
        }
    }

    if (!start || !end) {
        alert("Select a start and end to begin");
        return;
    }

    let i = 0;
    const open: Node[] = [];
    const closed: Node[] = [];
    open.push(start);
    while (i < 10000) {
        const currentNode = findNodeWithLowestFCost(open);
        if (!currentNode) break;
        const indexOfCurrent = open.indexOf(currentNode);
        open.splice(indexOfCurrent, 1);
        closed.push(currentNode);

        if (closed.indexOf(end) > 0) {
            currentNode.setType(NodeTypes.end);
            const parents = getParents(currentNode);
            for (let p = 0; p <= parents.length - 1; p++) {
                const node = parents[p];
                if (node.isPossiblity) node.setType(NodeTypes.path);
            }
            break;
        }
        
        const neighbors = findNeigbors(currentNode);

        for (let n = 0; n <= neighbors.length - 1; n++) {
            const nBor = neighbors[n];
            if (nBor.traversable && closed.indexOf(nBor) < 0) {
                if (open.indexOf(nBor) > 0) {
                    const newG = distBetween(start.centerPoint, nBor.centerPoint);
                    if (newG < nBor.gCost) {
                        nBor.gCost = newG;
                        nBor.parent = currentNode;
                    }
                } else {
                    nBor.parent = currentNode;
                    nBor.hCost = distBetween(end.centerPoint, nBor.centerPoint);
                    nBor.gCost = distBetween(start.centerPoint, nBor.centerPoint);
                    if (!nBor.isEnd) nBor.setType(NodeTypes.possiblities);
                    open.push(nBor);
                }
            }
        }
        i++;
    }
}

let searchActive = false;
let isDragging = false;
let nodeType: NodeTypes = NodeTypes.empty;

canvas.addEventListener('mousemove', (event: MouseEvent) => {
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const node = row[j];
            if (ctx.isPointInPath(node.path, event.offsetX, event.offsetY)) {
                if (isDragging && (nodeType === NodeTypes.empty || nodeType === NodeTypes.wall)) {
                    node.setType(nodeType);
                } else if (!isDragging && node.type == NodeTypes.empty) {
                    node.setType(NodeTypes.hover);
                }
            } else if (!node.hasValue) {
                node.setType(NodeTypes.empty);
            }
        }
    }
});

canvas.addEventListener('mousedown', (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    isDragging = true;
    nodeType = parseInt(select.value);
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
        for (let j = 0; j <= row.length - 1; j++) {
            const node = row[j];
            if ((nodeType === NodeTypes.start && node.type === NodeTypes.start)
                || (nodeType === NodeTypes.end && node.type === NodeTypes.end)) {
                node.setType(NodeTypes.empty);
            }
            if (ctx.isPointInPath(node.path, event.offsetX, event.offsetY)) {
                node.setType(nodeType);
            }
        }
    }
    if (searchActive) search();
});

clearButton.addEventListener('click', (event: MouseEvent) => {
    searchActive = false;
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const node = row[j];
            node.setType(NodeTypes.empty);
        }
    }
});

startButton.addEventListener('click', (event: MouseEvent) => {
    searchActive = true;
    search();
})






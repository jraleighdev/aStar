import { Point } from "./interfaces/point";
import { algoTypes } from "./models/algo-types";
import { Node } from "./models/node";
import { NodeTypes } from "./models/node-type";

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
const algorithmSelect: HTMLSelectElement = document.getElementById('algorithm-select') as HTMLSelectElement;
const drawingToolSelect: HTMLSelectElement = document.getElementById('drawing-tool-select') as HTMLSelectElement;
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
            const algo: algoTypes = parseInt(algorithmSelect.value);
            switch (algo) {
                case algoTypes.aStar:
                    ctx.font = '16px Arial';
                    ctx.strokeText(node.fCost.toString(), node.x * dim + dim / 2.5, node.y * dim + dim / 1.2)
                    ctx.font = '16px Arial'
                    ctx.strokeText(node.gCost.toString(), node.x * dim + dim / 7, node.y * dim + dim / 4)
                    ctx.font = '16px Arial'
                    ctx.strokeText(node.hCost.toString(), node.x * dim + dim / 1.6, node.y * dim + dim / 4)
                    break;
                case algoTypes.dijkstra:
                default:
                    ctx.font = '16px Arial'
                    ctx.strokeText(Number.isFinite(node.hCost) ? node.hCost.toString() : '0', node.x * dim + dim / 2.5, node.y * dim + dim / 2)
                    break;
            }

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

const getNeiboringPoints = (point: Point): Point[] => [
        /*leftCenter*/  { x: point.x - 1, y: point.y },
        /*leftUpper*/   { x: point.x - 1, y: point.y - 1 },
        /*upper*/       { x: point.x, y: point.y - 1 },
        /*rightUpper*/  { x: point.x + 1, y: point.y - 1 },
        /*right*/       { x: point.x + 1, y: point.y },
        /*rightBottom*/ { x: point.x + 1, y: point.y + 1 },
        /*bottom*/      { x: point.x, y: point.y + 1 },
        /*leftBottom*/  { x: point.x - 1, y: point.y + 1 }
]


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
    const nodes: Node[] = [];
    let i = 0;
    let currentNode = node.parent;
    while (currentNode && !currentNode.isStart) {
        nodes.push(currentNode);
        currentNode = currentNode.parent;
        if (i > 10000) {
            console.log('get parents hit 10000')
            break;
        }
        i++;
    }
    return nodes;
}

const aStar = () => {

    let start: Node | undefined;
    let end: Node | undefined;

    // find start and end and cleanup from previous runs
    for (let i = 0; i <= grid.length - 1; i++) {
        for (let j = 0; j <= grid[i].length - 1; j++) {
            const node = grid[i][j];
            if (node.isStart) start = node;
            if (node.isEnd) end = node;

            if (!(node.isStart || node.isEnd || node.isWall)) {
                node.setType(NodeTypes.empty);
            }
        }
    }

    if (!start || !end) {
        alert("Select a start and end to begin");
        return;
    }


    const open: Node[] = [];
    const closed: Node[] = [];

    // start by adding the first node
    open.push(start);

    let i = 0;
    while (i < 10000) {

        // get the node with the lowest fcost is the current 
        // shortest distance to the end node
        const currentNode = findNodeWithLowestFCost(open);
        if (!currentNode) break;

        // take the current node and add it the closed list
        // the closed won't be searched again
        const indexOfCurrent = open.indexOf(currentNode);
        open.splice(indexOfCurrent, 1);
        closed.push(currentNode);

        // current node is the end node end the loop
        if (closed.indexOf(end) > 0) {

            // TODO might be able to remove this 
            currentNode.setType(NodeTypes.end);

            // recurse the current node and get the parents
            // each node in parents represents the path
            // Goes from the end node back the start node
            // |S| <- |P| <- |P| <- |E|
            const parents = getParents(currentNode);
            for (let p = 0; p <= parents.length - 1; p++) {
                const node = parents[p];

                // set the nodes possibilty nodes to path
                // the other two nodes in the array are the start
                // and the end node
                if (node.isPossiblity) node.setType(NodeTypes.path);
            }
            break;
        }

        // get the neighbors of this node
        //  [N][N][N]
        //  [N]{C}[N]
        //  [N][N][N]
        const neighbors = findNeigbors(currentNode);

        for (let n = 0; n <= neighbors.length - 1; n++) {
            const nBor = neighbors[n];
            if (nBor.traversable && closed.indexOf(nBor) < 0) {

                // if neighbor is already in the open list
                // check gCost of the node and see if it is lower
                // if lower then update the gCost to the lower value
                // set the parent of the neigbor to the current node
                if (open.indexOf(nBor) > 0) {
                    const newG = distBetween(start.point, nBor.point);
                    if (newG < nBor.gCost) {
                        nBor.gCost = newG;
                        nBor.parent = currentNode;
                    }
                } else {
                    nBor.parent = currentNode;
                    nBor.hCost = distBetween(end.point, nBor.point);
                    nBor.gCost = distBetween(start.point, nBor.point);
                    // prevent changing the color of the end node.
                    if (!nBor.isEnd) nBor.setType(NodeTypes.possiblities);
                    open.push(nBor);
                }
            }
        }
        i++;
    }
}

const dijkstra = () => {
    let start: Node | undefined;
    let end: Node | undefined;

    const unexplored: Node[] = [];
    // find start and end and cleanup from previous runs
    for (let i = 0; i <= grid.length - 1; i++) {
        for (let j = 0; j <= grid[i].length - 1; j++) {
            const node = grid[i][j];
            if (node.isStart) start = node;
            if (node.isEnd) end = node;

            if (!(node.isStart || node.isEnd || node.isWall)) {
                node.setType(NodeTypes.empty);
            }

            // set each distance node to positive infinity 
            // makes determining initial distance simple
            node.hCost = Number.POSITIVE_INFINITY;
            unexplored.push(node);
        }
    }

    if (!start || !end) {
        alert("Select a start and end to begin");
        return;
    }

    // important first node set to 0
    start.hCost = 0;

    while (unexplored.length > 0) {

        // find the node with the min distance
        const minHCost = Math.min(...unexplored.map(x => x.hCost));
        const currentNode = unexplored.find(x => Math.abs(x.hCost - minHCost) < 0.1);

        if (currentNode) {
            const index = unexplored.indexOf(currentNode);
            unexplored.splice(index, 1);

            // we found the end node exit
            // and mark the path
            if (currentNode.isEnd) {

                // recurse the current node and get the parents
                // each node in parents represents the path
                // Goes from the end node back the start node
                // |S| <- |P| <- |P| <- |E|
                const parents = getParents(currentNode);
                for (let p = 0; p <= parents.length - 1; p++) {
                    const node = parents[p];

                    // set the nodes possibilty nodes to path
                    // the other two nodes in the array are the start
                    // and the end node
                    if (node.isPossiblity) node.setType(NodeTypes.path);
                }
                break;
            }

            // get the neighbors of this node
            //  [N][N][N]
            //  [N]{C}[N]
            //  [N][N][N]
            const neigbors = getNeiboringPoints(currentNode.point)
            for (let i = 0; i <= neigbors.length - 1; i++) {
                const point = neigbors[i];
                // check if one of points exist in the unexplored list
                const match = unexplored.find(x => x.isMatch(point));
                if (match && match.traversable) {
                    // get the distance between current node and the neighbor
                    // if new distance is less than neigbors current distance
                    // then update neighbor to new dist and assign current to its parent
                    const newDist = currentNode.hCost + distBetween(currentNode.point, match.point);
                    if (newDist < match.hCost) {
                        match.hCost = newDist;
                        match.parent = currentNode;
                    }

                    // mark the explored nodes
                    if (!match.isEnd && !match.isStart) {
                        match.setType(NodeTypes.possiblities);
                    }
                }

            }
        }
    }


}

const search = () => {
    const algo: algoTypes = parseInt(algorithmSelect.value);

    switch (algo) {
        case algoTypes.aStar:
            aStar();
            break;
        case algoTypes.dijkstra:
            dijkstra();
            break;
        default:
            aStar();
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
    nodeType = parseInt(drawingToolSelect.value);
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

clearButton.addEventListener('click', () => {
    searchActive = false;
    for (let i = 0; i <= grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j <= row.length - 1; j++) {
            const node = row[j];
            node.setType(NodeTypes.empty);
        }
    }
});

startButton.addEventListener('click', () => {
    searchActive = true;
    search();
})






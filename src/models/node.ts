import { Point } from "../interfaces/point";
import { NodeTypes } from "./node-type";

export class Node {

    public path: Path2D;

    public hasValue = false;

    public traversable = false;

    // distance between node and start
    public hCost = 0;

    // distance between node and end
    public gCost = 0;

    get fCost(): number {
        return this.gCost + this.hCost;
    }

    get point(): Point {
        return { x: this.x, y: this.y }
    }

    // 
    public parent: Node | undefined;

    constructor(
        public x: number,
        public y: number,
        public dim: number,
        public type: NodeTypes
    ) {
        this.path = new Path2D();
        this.path.rect(x * dim, y * dim, dim, dim);
    }

    public setType(type: NodeTypes): void {
        this.type = type;
        switch (type) {
            case NodeTypes.empty:
                this.hasValue = false;
                this.traversable = true;
                this.hCost = 0;
                this.gCost = 0;
                this.parent = undefined;
                break;
            case NodeTypes.hover:
                this.hasValue = false;
                this.traversable = true;
                break;
            case NodeTypes.wall:
                this.hasValue = true;
                this.traversable = false;
                this.parent = undefined;
                break;
            case NodeTypes.start:
            case NodeTypes.end:
            case NodeTypes.path:
            case NodeTypes.possiblities:
                this.hasValue = true;
                this.traversable = true;
                break;
        }
    }

    get isStart(): boolean {
        return this.type === NodeTypes.start;
    }

    get isEnd(): boolean {
        return this.type === NodeTypes.end;
    }

    get isWall(): boolean {
        return this.type === NodeTypes.wall;
    }

    get isPossiblity(): boolean {
        return this.type === NodeTypes.possiblities;
    }

    get color(): string {
        return this.colorsMap()[this.type];
    }

    isMatch(point: Point) {
        return Math.abs(this.point.x - point.x) < 0.1 && Math.abs(this.point.y - point.y) < 0.1;
    }

    colorsMap(): Record<NodeTypes, string> {
        return {
            [NodeTypes.empty]: 'white',
            [NodeTypes.end]: 'red',
            [NodeTypes.start]: 'green',
            [NodeTypes.path]: 'blue',
            [NodeTypes.hover]: 'orange',
            [NodeTypes.wall]: 'grey',
            [NodeTypes.possiblities]: 'yellow'
        }
    }
}
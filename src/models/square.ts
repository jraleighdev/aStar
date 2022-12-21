import { Point } from "./point";
import { SquareTypes } from "./square-types";

export class Square {

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

    get centerPoint(): Point {
        return { x: this.x, y: this.y }
    }

    public parent: Square | undefined;

    constructor(
        public x: number,
        public y: number,
        public dim: number,
        public type: SquareTypes
    ) {
        this.path = new Path2D();
        this.path.rect(x * dim, y * dim, dim, dim);
    }

    public setType(type: SquareTypes): void {
        this.type = type;
        switch (type) {
            case SquareTypes.empty:
            case SquareTypes.hover:
                this.hasValue = false;
                this.traversable = true;
                break;
            case SquareTypes.wall:
                this.hasValue = true;
                this.traversable = false;
                break;
            case SquareTypes.start:
            case SquareTypes.end:
            case SquareTypes.path:
            case SquareTypes.possiblities:
                this.hasValue = true;
                this.traversable = true;
                break;
        }
    }

    public setIsPossible(): void {
        this.setType(SquareTypes.possiblities);
    }

    get isStart(): boolean {
        return this.type === SquareTypes.start;
    }

    get isEnd(): boolean {
        return this.type === SquareTypes.end;
    }

    get isWall(): boolean {
        return this.type === SquareTypes.wall;
    }

    get isEmpty(): boolean {
        return this.type === SquareTypes.empty;
    }

    get isPath(): boolean {
        return this.type === SquareTypes.path;
    }

    get color(): string {
        return this.colorsMap()[this.type];
    }

    isMatch(square: Square): boolean {
        return square.x == this.x && square.y == this.y;
    }

    colorsMap(): Record<SquareTypes, string> {
        return {
            [SquareTypes.empty]: 'white',
            [SquareTypes.end]: 'red',
            [SquareTypes.start]: 'green',
            [SquareTypes.path]: 'blue',
            [SquareTypes.hover]: 'orange',
            [SquareTypes.wall]: 'grey',
            [SquareTypes.possiblities]: 'yellow'
        }
    }
}
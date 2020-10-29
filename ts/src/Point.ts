import assert from 'assert';

export default class Point {
	_y: number;
	_x: number;

	constructor(x: number, y: number) {
		assert(Math.floor(x) === x, 'x coordinate must be an integer');
		assert(Math.floor(y) === y, 'y coordinate must be an integer');

		this._x = x;
		this._y = y;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	compareTo(other: Point): number {
		if (this._y < other.y) {
			return -1;
		} else if (this._y > other.y) {
			return 1;
		}

		return this._x - other.x;
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {
		await canvas(
			async (context: CanvasRenderingContext2D, ...args: Array<any>) => {
				const [x, y] = args;

				const transformed = await (window as any).transform({x, y});

				context.fillStyle = 'rgb(255, 0, 0)';

				context.fillRect(transformed.x - 2, transformed.y - 2, 4, 4);
			},
			this._x,
			this._y
		);
	}

	slope(other: Point): number {
		const x = other.x - this._x;
		const y = other.y - this._y;

		if (x === 0) {
			if (y === 0) {
				return -Infinity;
			} else {
				return Infinity;
			}
		} else if (y === 0) {
			return 0;
		} else {
			return y / x;
		}
	}

	slopeOrder() {
		return (a: Point, b: Point): number => {
			const slopeToA = this.compareTo(a);

			const slopeToB = this.compareTo(b);

			return slopeToA - slopeToB;
		};
	}

	toString() {
		return `(${this._x}, ${this._y})`;
	}
}

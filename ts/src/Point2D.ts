export default class Point2D {
	_x: number;
	_y: number;

	constructor(x: number, y: number) {
		this._x = x;
		this._y = y;
	}

	compareTo(that: Point2D): number {
		if (this._x < that._x) {
			return -1;
		} else if (this._x > that._x) {
			return 1;
		} else {
			return this._y - that._y;
		}
	}

	distanceSquaredTo(that: Point2D): number {
		return (this._x - that._x) ** 2 + (this._y - that._y) ** 2;
	}

	distanceTo(that: Point2D): number {
		return Math.sqrt(this.distanceSquaredTo(that));
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {
		await canvas(
			async (context: CanvasRenderingContext2D, ...args: Array<any>) => {
				const [point] = args;

				const {x, y} = await (window as any).transform(point);

				const circle = new Path2D();

				circle.arc(x, y, 2, 0, 2 * Math.PI);

				context.fillStyle = 'rgb(0, 0, 0)';

				context.fill(circle);
			},
			{x: this._x, y: this._y}
		);
	}

	equals(that: unknown): boolean {
		if (isPoint2D(that)) {
			return this._x === that._x && this._y === that._y;
		}

		return false;
	}

	toString(): string {
		return `(${this._x}, ${this._y})`;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}
}

function isPoint2D(value: unknown): value is Point2D {
	return !!(value && Object.getPrototypeOf(value) === Point2D.prototype);
}

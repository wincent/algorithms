import Point2D from './Point2D';

export default class RectHV {
	_xmax: number;
	_xmin: number;
	_ymax: number;
	_ymin: number;

	constructor(xmin: number, ymin: number, xmax: number, ymax: number) {
		this._xmax = xmax;
		this._xmin = xmin;
		this._ymax = ymax;
		this._ymin = ymin;
	}

	contains(p: Point2D): boolean {
		return (
			p.x >= this._xmin &&
			p.x <= this._xmax &&
			p.y >= this._ymin &&
			p.y <= this._ymax
		);
	}

	distanceSquaredTo(p: Point2D): number {
		let xDistance = 0;
		let yDistance = 0;

		if (p.x < this._xmin) {
			xDistance = this._xmin - p.x;
		} else if (p.x > this._xmax) {
			xDistance = p.x - this._xmax;
		}

		if (p.y < this._ymin) {
			yDistance = this._ymin - p.y;
		} else if (p.y > this._ymax) {
			yDistance = p.y - this._ymax;
		}

		return xDistance ** 2 + yDistance ** 2;
	}

	distanceTo(p: Point2D): number {
		return Math.sqrt(this.distanceSquaredTo(p));
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {
		await canvas(
			async (context: CanvasRenderingContext2D, ...args: Array<any>) => {
				const [xmin, ymin, xmax, ymax] = args;

				const {x: left, y: top} = await (window as any).transform({
					x: xmin,
					y: ymin,
				});

				const {x: right, y: bottom} = await (window as any).transform({
					x: xmax,
					y: ymax,
				});

				context.strokeStyle = 'rgb(0, 0, 0)';

				context.strokeRect(left, top, right - left, bottom - top);
			},
			this._xmin,
			this._ymin,
			this._xmax,
			this._ymax
		);
	}

	equals(that: unknown): boolean {
		if (isRectHV(that)) {
			return (
				this._xmax === that._xmax &&
				this._xmin === that._xmin &&
				this._ymax === that._ymax &&
				this._ymin === that._ymin
			);
		}

		return false;
	}

	intersects(that: RectHV): boolean {
		return !(
			this._xmin > that._xmax ||
			this._xmax < that._xmin ||
			this._ymin > that._ymax ||
			this._ymax < that._ymin
		);
	}

	toString(): string {
		// Match Java string description format.

		return `[${this.xmin}, ${this.ymin}] x [${this.xmax}, ${this.ymax}]`;
	}

	get xmax() {
		return this._xmax;
	}

	get xmin() {
		return this._xmin;
	}

	get ymax() {
		return this._ymax;
	}

	get ymin() {
		return this._ymin;
	}
}

function isRectHV(value: unknown): value is RectHV {
	return !!(value && Object.getPrototypeOf(value) === RectHV.prototype);
}

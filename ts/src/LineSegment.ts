import type Point from './Point';

export default class LineSegment {
	_p: Point;
	_q: Point;

	constructor(p: Point, q: Point) {
		this._p = p;
		this._q = q;
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {
		await canvas(
			async (context: CanvasRenderingContext2D, ...args: Array<any>) => {
				const [p, q] = args;

				const {x: px, y: py} = await (window as any).transform({
					x: p.x,
					y: p.y,
				});

				const {x: qx, y: qy} = await (window as any).transform({
					x: q.x,
					y: q.y,
				});

				context.fillStyle = 'rgb(0, 0, 255)';
				context.beginPath();
				context.moveTo(px, py);
				context.lineTo(qx, qy);
				context.stroke();
			},
			{x: this._p.x, y: this._p.y},
			{x: this._q.x, y: this._q.y}
		);
	}

	toString(): string {
		return `${this._p.toString()} -> ${this._q.toString()}`;
	}
}

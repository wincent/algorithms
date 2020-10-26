import type Point from './Point';

export default class LineSegment {
	_p: Point;
	_q: Point;

	constructor(p: Point, q: Point) {
		this._p = p;
		this._q = q;
	}

	toString(): string {
		return `${this._p.toString()} -> ${this._q.toString()}`;
	}
}

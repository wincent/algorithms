import assert from 'assert';

type Ordering = -1 | 0 | 1;

export default class Point {
	_y: number;
	_x: number;

	constructor(x: number, y: number) {
		assert(Math.floor(x) === x, 'x coordinate must be an integer');
		assert(Math.floor(y) === y, 'y coordinate must be an integer');

		this._x = x;
		this._y = y;
	}

	compareTo(other: Point): Ordering {
		// TODO: implement
		return 0;
	}

	slope(other: Point): number {
		// TODO: implement
		return 0;
	}

	slopeOrder() {
		// TODO: implement
	}

	toString() {
		return `(${this._x}, ${this._y})`;
	}
}

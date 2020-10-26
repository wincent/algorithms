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

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	compareTo(other: Point): Ordering {
		if (this._y < other.y) {
			return -1;
		} else if (this._y > other.y) {
			return 1;
		} else if (this._x < other.x) {
			return -1;
		} else if (this._x > other.x) {
			return 1;
		} else {
			return 0;
		}
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
		return (a: Point, b: Point): Ordering => {
			const slopeToA = this.compareTo(a);

			const slopeToB = this.compareTo(b);

			if (slopeToA < slopeToB) {
				return -1;
			} else if (slopeToA > slopeToB) {
				return 1;
			} else {
				return 0;
			}
		};
	}

	toString() {
		return `(${this._x}, ${this._y})`;
	}
}

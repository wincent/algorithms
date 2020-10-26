const assert = require('assert');

class Point {
	constructor(x, y) {
		assert(Math.floor(x) === x, 'x coordinate must be an integer');
		assert(Math.floor(y) === y, 'y coordinate must be an integer');

		this._x = x;
		this._y = y;
	}

	compareTo(other) {
		// TODO: implement
		return 0;
	}

	slope(other) {
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

module.exports = Point;

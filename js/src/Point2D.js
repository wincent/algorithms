module.exports = class Point2D {
	constructor(x, y) {
		this._x = x;
		this._y = y;
	}

	compareTo(that) {
		if (this._x < that._x) {
			return -1;
		} else if (this._x > that._x) {
			return 1;
		} else {
			return this._y - that._y;
		}
	}

	distanceSquaredTo(that) {
		return (this._x - that._x) ** 2 + (this._y - that._y) ** 2;
	}

	distanceTo(that) {
		return Math.sqrt(this.distanceSquaredTo(that));
	}

	async draw(canvas) {
		await canvas(
			async (context, ...args) => {
				const [point] = args;

				const {x, y} = await window.transform(point);

				const circle = new Path2D();

				circle.arc(x, y, 2, 0, 2 * Math.PI);

				context.fillStyle = 'rgb(0, 0, 0)';

				context.fill(circle);
			},
			{x: this._x, y: this._y}
		);
	}

	equals(that) {
		if (isPoint2D(that)) {
			return this._x === that._x && this._y === that._y;
		}

		return false;
	}

	toString() {
		return `(${this._x}, ${this._y})`;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}
};

function isPoint2D(value) {
	return !!(value && Object.getPrototypeOf(value) === Point2D.prototype);
}

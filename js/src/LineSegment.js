class LineSegment {
	constructor(p, q) {
		this._p = p;
		this._q = q;
	}

	toString() {
		return `${this._p.toString()} -> ${this._q.toString()}`;
	}
}

module.exports = LineSegment;

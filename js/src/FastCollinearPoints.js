const LineSegment = require('./LineSegment');
const Point = require('./Point');

class FastCollinearPoints {
	constructor(points) {
		this._points = points;
	}

	numberOfSegments() {
		// TODO: implement
		return NaN;
	}

	segments() {
		// TODO: implement
		return [new LineSegment(new Point(10, 20), new Point(50, 10))];
	}
}

module.exports = FastCollinearPoints;

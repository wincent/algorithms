import LineSegment from './LineSegment';

import Point from './Point';

export default class FastCollinearPoints {
	_points: Array<Point>;

	constructor(points: Array<Point>) {
		this._points = points;
	}

	numberOfSegments(): number {
		// TODO: implement
		return NaN;
	}

	segments(): Array<LineSegment> {
		// TODO: implement
		return [new LineSegment(new Point(10, 20), new Point(50, 10))];
	}
}

import type LineSegment from './LineSegment';
import type Point from './Point';

export default class BruteCollinearPoints {
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
		return [];
	}
}

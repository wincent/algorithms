import LineSegment from './LineSegment';
import Point from './Point';

/**
 * The number of points that must be collinear in order to form a segment.
 */
const MINIMUM_SEGMENT_SIZE = 4;

export default class FastCollinearPoints {
	_points: Array<Point>;

	constructor(points: Array<Point>) {
		this._points = points;
	}

	numberOfSegments(): number {
		return this.segments().length;
	}

	segments(): Array<LineSegment> {
		if (this._points.length < MINIMUM_SEGMENT_SIZE) {
			return [];
		}

		const segments: Array<LineSegment> = [];

		for (let i = 0; i < this._points.length; i++) {
			const p = this._points[i];

			const slopes: Array<{point: Point; slope: number}> = [];

			for (let j = 1; j < this._points.length; j++) {
				if (i === j) {
					continue;
				}

				const q = this._points[j];

				slopes.push({
					point: q,
					slope: p.slope(q),
				});
			}

			slopes.sort((a, b) => {
				return a.slope - b.slope || a.point.compareTo(b.point);
			});

			let start = 0;
			let previous = slopes[start];

			for (let j = 1; j < slopes.length; j++) {
				const current = slopes[j];

				const minimum = slopes[start].point;

				if (current.slope !== previous.slope) {
					const maximum = previous.point;

					if (
						j - start >= MINIMUM_SEGMENT_SIZE - 1 &&
						p.compareTo(minimum) < 0
					) {
						segments.push(new LineSegment(p, maximum));
					}

					start = j;
				} else if (j === slopes.length - 1) {
					const maximum = current.point;

					if (
						j - start >= MINIMUM_SEGMENT_SIZE - 1 &&
						p.compareTo(minimum) < 0
					) {
						segments.push(new LineSegment(p, maximum));
					}

					start = j;
				}

				previous = current;
			}
		}

		return segments;
	}
}

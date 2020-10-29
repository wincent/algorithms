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

			slopes.sort((a, b) => a.slope - b.slope);

			let equal: Array<{point: Point; slope: number}> = [];

			for (let j = 0; j < slopes.length; j++) {
				const current = slopes[j];

				if (!equal.length) {
					equal.push(current);

					continue;
				} else if (equal[equal.length - 1].slope === current.slope) {
					equal.push(current);

					if (j !== slopes.length - 1) {
						continue;
					}
				}

				if (equal.length >= MINIMUM_SEGMENT_SIZE - 1) {
					let minimum = {point: p, slope: -Infinity};
					let maximum = {point: p, slope: -Infinity};

					for (let k = 0; k < equal.length; k++) {
						const {point} = equal[k];

						if (point.compareTo(minimum.point) < 0) {
							minimum = equal[k];
						}

						if (point.compareTo(maximum.point) > 0) {
							maximum = equal[k];
						}
					}

					if (p.compareTo(minimum.point) === 0) {
						segments.push(
							new LineSegment(minimum.point, maximum.point)
						);
					}
				}

				equal = [current];
			}
		}

		return segments;
	}
}

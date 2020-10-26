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
		const segments: Map<string, LineSegment> = new Map();

		if (this._points.length < MINIMUM_SEGMENT_SIZE) {
			return [];
		}

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

			// TODO: write a sort API matching the one they describe in the
			// course instead of using the JS one; also, use the compareTo()
			// function.

			slopes.sort((a, b) => {
				if (a.slope < b.slope) {
					return -1;
				} else if (a.slope > b.slope) {
					return 1;
				} else {
					return 0;
				}
			});

			let equal: Array<{point: Point; slope: number}> = [];

			for (let j = 0; j < slopes.length; j++) {
				const current = slopes[j];

				if (!equal.length) {
					equal.push(current);
				} else if (equal[equal.length - 1].slope === current.slope) {
					equal.push(current);
				} else {
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

						const segment = new LineSegment(
							minimum.point,
							maximum.point
						);

						segments.set(segment.toString(), segment);
					}

					equal = [current];
				}
			}
		}

		return Array.from(segments.values());
	}
}

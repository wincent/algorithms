import LineSegment from './LineSegment';
import Point from './Point';

export default class BruteCollinearPoints {
	_points: Array<Point>;

	constructor(points: Array<Point>) {
		this._points = points;
	}

	numberOfSegments(): number {
		return this.segments().length;
	}

	segments(): Array<LineSegment> {
		const segments: Map<string, LineSegment> = new Map();

		// Spec says, "For simplicity, we will not supply any input to
		// BruteCollinearPoints that has 5 or more collinear points", which
		// is why we aren't doing anything special to detect that kind of
		// input.

		for (let i = 0; i < this._points.length - 3; i++) {
			const p = this._points[i];

			for (let j = 1; j < this._points.length - 2; j++) {
				if (j === i) {
					continue;
				}

				const q = this._points[j];

				const pq = p.slope(q);

				for (let k = 2; k < this._points.length - 1; k++) {
					if (k === i || k === j) {
						continue;
					}

					const r = this._points[k];

					const pr = p.slope(r);

					if (pq !== pr) {
						continue;
					}

					for (let l = 3; l < this._points.length; l++) {
						if (l === i || l === j || l === k) {
							continue;
						}

						const s = this._points[l];

						const ps = p.slope(s);

						if (pq === ps) {
							let minimum = p;
							let maximum = p;

							[q, r, s].forEach((point) => {
								if (point.compareTo(minimum) < 0) {
									minimum = point;
								}

								if (point.compareTo(maximum) > 0) {
									maximum = point;
								}
							});

							const segment = new LineSegment(minimum, maximum);

							segments.set(segment.toString(), segment);
						}
					}
				}
			}
		}

		return Array.from(segments.values());
	}
}

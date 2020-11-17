import Point2D from './Point2D';
import RedBlackBST from './RedBlackBST';

import type RectHV from './RectHV';
import type {IPointSet} from './types';

export default class PointSET implements IPointSet {
	_points: RedBlackBST<Point2D, boolean>;

	constructor() {
		this._points = new RedBlackBST<Point2D, boolean>();
	}

	contains(p: Point2D): boolean {
		return this._points.get(p) !== null;
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {
		for (const point of this._points.keys()) {
			await point.draw(canvas);
		}
	}

	insert(p: Point2D) {
		this._points.put(p, true);
	}

	isEmpty(): boolean {
		return this.size === 0;
	}

	nearest(p: Point2D): Point2D | null {
		let closest = null;

		let minimum = Infinity;

		for (const other of this._points.keys()) {
			const distance = p.distanceSquaredTo(other);

			if (distance < minimum) {
				minimum = distance;
				closest = other;
			}
		}

		return closest;
	}

	/**
	 * All points that are inside `rect` or on the boundary.
	 */
	range(rect: RectHV): Iterable<Point2D> {
		const points = this._points.keys();

		return {
			*[Symbol.iterator]() {
				for (const point of points) {
					if (rect.contains(point)) {
						yield point;
					}
				}
			},
		};
	}

	get size(): number {
		return this._points.size;
	}
}

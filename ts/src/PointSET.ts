import type Point2D from './Point2D';
import type RectHV from './RectHV';
import type {IPointSet} from './types';

export default class PointSET implements IPointSet {
	contains(p: Point2D): boolean {
		return false;
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {}

	insert(p: Point2D) {}

	isEmpty(): boolean {
		return true;
	}

	nearest(p: Point2D): Point2D | null {
		return null;
	}

	/**
	 * All points that are inside `rect` or on the boundary.
	 */
	range(rect: RectHV): Iterable<Point2D> {
		return [];
	}

	get size(): number {
		return 0;
	}
}

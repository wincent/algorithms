import type Point2D from './Point2D';
import type RectHV from './RectHV';
import type {IPointSet} from './types';

/**
 * Despite the name, this is not a "k-d tree" but a 2D tree, because that's what
 * the exercise asks for.
 */
export default class KdTree implements IPointSet {
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

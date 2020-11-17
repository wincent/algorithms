import type Point2D from './Point2D';
import type RectHV from './RectHV';

export interface IPointSet {
	contains(p: Point2D): boolean;

	draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void>;

	insert(p: Point2D): void;

	isEmpty(): boolean;

	nearest(p: Point2D): Point2D | null;

	range(rect: RectHV): Iterable<Point2D>;

	size: number;
}

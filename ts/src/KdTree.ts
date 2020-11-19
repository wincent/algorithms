import Point2D from './Point2D';
import Queue from './Queue';
import RectHV from './RectHV';

import type {IPointSet} from './types';

type Node<Tk, Tv> = {
	key: Tk;
	left: Node<Tk, Tv> | null;
	right: Node<Tk, Tv> | null;
	value: Tv;
};

const BLUE = '#00f';
const RED = '#f00';

/**
 * Despite the name, this is not a "k-d tree" but a 2D tree, because that's what
 * the exercise asks for.
 */
export default class KdTree implements IPointSet {
	_extent: RectHV;
	_root: Node<Point2D, RectHV> | null;
	_size: number;

	constructor() {
		this._extent = new RectHV(0.0, 0.0, 1.0, 1.0);
		this._root = null;
		this._size = 0;
	}

	contains(p: Point2D): boolean {
		let node = this._root;
		let level = 0;

		while (node) {
			const other = node.key;

			if (other.equals(p)) {
				return true;
			}

			node = this._compare(p, other, level) < 0 ? node.left : node.right;

			level++;
		}

		return false;
	}

	async draw(
		canvas: (
			callback: (context: CanvasRenderingContext2D) => void,
			...args: Array<any>
		) => Promise<void>
	): Promise<void> {
		// Draw partition lines.

		const lines: Array<{
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			color: string;
		}> = [];

		const visit = (node: Node<Point2D, RectHV> | null, level: number) => {
			if (node) {
				if (isVertical(level)) {
					lines.push({
						x1: node.key.x,
						y1: node.value.ymin,
						x2: node.key.x,
						y2: node.value.ymax,
						color: RED,
					});
				} else {
					lines.push({
						x1: node.value.xmin,
						y1: node.key.y,
						x2: node.value.xmax,
						y2: node.key.y,
						color: BLUE,
					});
				}

				visit(node.left, level + 1);
				visit(node.right, level + 1);
			}
		};

		visit(this._root, 0);

		if (lines.length) {
			await canvas(
				async (
					context: CanvasRenderingContext2D,
					...args: Array<any>
				) => {
					const [lines] = args;

					for (const {x1, y1, x2, y2, color} of lines) {
						const {
							x: xStart,
							y: yStart,
						} = await (window as any).transform({x: x1, y: y1});

						const {
							x: xEnd,
							y: yEnd,
						} = await (window as any).transform({x: x2, y: y2});

						context.strokeStyle = color;
						context.beginPath();
						context.moveTo(xStart, yStart);
						context.lineTo(xEnd, yEnd);
						context.stroke();
					}
				},
				lines
			);
		}

		// Draw points.

		for (const point of this.range(this._extent)) {
			await point.draw(canvas);
		}
	}

	insert(p: Point2D) {
		this._root = this._put(p, this._root, this._extent, 0);
	}

	isEmpty(): boolean {
		return this.size === 0;
	}

	nearest(p: Point2D): Point2D | null {
		const [nearest] = this._nearest(p, this._root, 0, Infinity) || [null];

		return nearest;
	}

	/**
	 * All points that are inside `rect` or on the boundary.
	 */
	range(rect: RectHV): Iterable<Point2D> {
		const queue = new Queue<Point2D>();

		if (!this.isEmpty()) {
			this._range(this._root, queue, rect);
		}

		return queue;
	}

	get size(): number {
		return this._size;
	}

	_compare(a: Point2D, b: Point2D, level: number): number {
		if (isVertical(level)) {
			return a.x - b.x;
		} else {
			return a.y - b.y;
		}
	}

	/**
	 * "To find a closest point to a given query point, start at the
	 * root and recursively search in both subtrees using the following
	 * pruning rule: if the closest point discovered so far is closer
	 * than the distance between the query point and the rectangle
	 * corresponding to a node, there is no need to explore that node
	 * (or its subtrees). That is, search a node only only if it might
	 * contain a point that is closer than the best one found so
	 * far. The effectiveness of the pruning rule depends on quickly
	 * finding a nearby point. To do this, organize the recursive
	 * method so that when there are two possible subtrees to go down,
	 * you always choose the subtree that is on the same side of the
	 * splitting line as the query point as the first subtree to
	 * explore—the closest point found while exploring the first subtree
	 * may enable pruning of the second subtree."
	 */
	_nearest(
		p: Point2D,
		node: Node<Point2D, RectHV> | null,
		level: number,
		closest: number
	): [nearest: Point2D, distance: number] | null {
		if (!node) {
			return null;
		}

		let nearest = null;
		let distance = node.key.distanceSquaredTo(p);

		if (distance < closest) {
			closest = distance;
			nearest = node.key;
		}

		const queue: Array<Node<Point2D, RectHV> | null> = [];

		if (
			(isVertical(level) && p.x < node.key.x) ||
			(!isVertical(level) && p.y < node.key.y)
		) {
			queue.push(node.left, node.right);
		} else {
			queue.push(node.right, node.left);
		}

		for (const candidate of queue) {
			if (candidate) {
				if (candidate.value.distanceSquaredTo(p) <= closest) {
					[nearest, closest] = this._nearest(
						p,
						candidate,
						level + 1,
						closest
					) || [nearest, closest];
				}
			}
		}

		return nearest ? [nearest, closest] : null;
	}

	_put(
		point: Point2D,
		node: Node<Point2D, RectHV> | null,
		context: RectHV,
		level: number
	): Node<Point2D, RectHV> {
		if (!node) {
			node = {
				key: point,
				left: null,
				right: null,
				value: context,
			};

			this._size++;

			return node;
		}

		const comparison = this._compare(point, node.key, level);

		if (comparison < 0) {
			node.left = this._put(
				point,
				node.left,
				node.left
					? node.left.value
					: isVertical(level)
					? new RectHV(
							context.xmin,
							context.ymin,
							node.key.x,
							context.ymax
					  )
					: new RectHV(
							context.xmin,
							context.ymin,
							context.xmax,
							node.key.y
					  ),
				level + 1
			);
		} else {
			node.right = this._put(
				point,
				node.right,
				node.right
					? node.right.value
					: isVertical(level)
					? new RectHV(
							node.key.x,
							context.ymin,
							context.xmax,
							context.ymax
					  )
					: new RectHV(
							context.xmin,
							node.key.y,
							context.xmax,
							context.ymax
					  ),
				level + 1
			);
		}

		return node;
	}

	/**
	 * "To find all points contained in a given query rectangle, start
	 * at the root and recursively search for points in both subtrees
	 * using the following pruning rule: if the query rectangle does
	 * not intersect the rectangle corresponding to a node, there is
	 * no need to explore that node (or its subtrees). A subtree is
	 * searched only if it might contain a point contained in the query
	 * rectangle."
	 */
	_range(
		node: Node<Point2D, RectHV> | null,
		queue: Queue<Point2D>,
		query: RectHV
	) {
		if (node === null) {
			return;
		}

		const point = node.key;

		if (query.contains(point)) {
			queue.enqueue(point);
		}

		if (node.left?.value.intersects(query)) {
			this._range(node.left, queue, query);
		}

		if (node.right?.value.intersects(query)) {
			this._range(node.right, queue, query);
		}
	}
}

function isVertical(level: number) {
	return !(level % 2);
}

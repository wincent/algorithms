/**
 * Despite the name, this is not a "k-d tree" but a 2D tree, because that's what
 * the exercise asks for.
 */
class KdTree {
	contains(p) {
		return false;
	}

	async draw(canvas) {}

	insert(p) {}

	isEmpty() {
		return true;
	}

	nearest(p) {
		return null;
	}

	/**
	 * All points that are inside `rect` or on the boundary.
	 */
	range(rect) {
		return [];
	}

	get size() {
		return 0;
	}
}

module.exports = KdTree;

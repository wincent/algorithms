module.exports = class PointSET {
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
};

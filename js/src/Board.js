module.exports = class Board {
	constructor(tiles) {
		this._tiles = tiles;
	}

	/**
	 * Returns the board dimension, "n".
	 */
	dimension() {
		// TODO: provide real implementation
		return 0;
	}

	/**
	 * Does this board equal `other`?
	 */
	equals(other) {
		return true;
	}

	/**
	 * Returns the Hamming distance (number of tiles out of place).
	 */
	hamming() {
		// TODO: provide real implementation
		return 0;
	}

	/**
	 * Is this board the goal board?
	 */
	isGoal() {
		// TODO: provide real implementation
		return true;
	}

	/**
	 * Returns the total Manhattan distances (sum of distances between
	 * tiles and goal).
	 */
	manhattan() {
		// TODO: provide real implementation
		return 0;
	}

	/**
	 * All neighboring boards.
	 */
	neighbors() {
		// TODO: provide real implementation
		return {
			[Symbol.iterator]() {
				return {
					next() {
						return {
							done: true,
							value: undefined,
						};
					},
				};
			},
		};
	}

	toString() {
		// TODO: provide real implementation
		return '...';
	}

	/**
	 * Returns a board that is obtained by exchanging any pair of tiles.
	 */
	twin() {
		// TODO: provide a real implementation
		return new Board([]);
	}
};

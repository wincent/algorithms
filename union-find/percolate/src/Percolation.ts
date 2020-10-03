import UnionFind from './UnionFind';

const BLOCKED = '🛑';
const EMPTY = '  ';
const FULL = '💧';

export default class Percolation {
	#cells: Array<boolean>;
	#connections: UnionFind;
	#lowest: Map<number, number>;
	#open: number;
	#percolates: boolean;
	#size: number;
	#top: number;

	/**
	 * Creates n-by-n grid, with all sites initially blocked.
	 */
	constructor(size: number) {
		this.#cells = new Array(size * size).fill(false);
		this.#connections = new UnionFind(size * size + 1);
		this.#lowest = new Map();
		this.#open = 0;
		this.#percolates = false;
		this.#size = size;

		// Additional virtual site for linking to at top.

		this.#top = this.#connections.size - 1;
	}

	/**
	 * Opens the site (row, column) if it is not open already.
	 */
	open(row: number, column: number) {
		const index = row * this.#size + column;

		if (this.#cells[index]) {
			return true;
		}

		this.#cells[index] = true;
		this.#open++;

		// Link with open neighbors.

		if (row === 0) {
			this.#connections.union(index, this.#top);
		}

		if (row > 0 && this.isOpen(row - 1, column)) {
			this.#connections.union(index, (row - 1) * this.#size + column);
		}

		if (row < this.#size - 1 && this.isOpen(row + 1, column)) {
			this.#connections.union(index, (row + 1) * this.#size + column);
		}

		if (column > 0 && this.isOpen(row, column - 1)) {
			this.#connections.union(index, row * this.#size + column - 1);
		}

		if (column < this.#size - 1 && this.isOpen(row, column + 1)) {
			this.#connections.union(index, row * this.#size + column + 1);
		}

		// Detect percolation.
		const leader = this.#connections.find(index);

		let lowest = this.#lowest.get(leader);

		if (lowest === undefined || index > lowest) {
			this.#lowest.set(leader, index);

			lowest = index;
		}

		if (
			Math.floor(lowest / this.#size) === this.#size - 1 &&
			this.isFull(Math.floor(lowest / this.#size), lowest % this.#size)
		) {
			this.#percolates = true;
		}
	}

	/**
	 * Is the site (row, column) open?
	 */
	isOpen(row: number, column: number) {
		return this.#cells[row * this.#size + column];
	}

	/**
	 * Is the site (row, column) full?
	 */
	isFull(row: number, column: number): boolean {
		const index = row * this.#size + column;

		return (
			this.#connections.find(index) === this.#connections.find(this.#top)
		);
	}

	/**
	 * Returns the number of open sites.
	 */
	numberOfOpenSites(): number {
		return this.#open;
	}

	/**
	 * Does the system percolate?
	 */
	percolates(): boolean {
		return this.#percolates;
	}

	toString() {
		const separator = '---'.repeat(this.#size) + '\n';

		let grid = '';

		for (let row = 0; row < this.#size; row++) {
			grid += separator;
			for (let column = 0; column < this.#size; column++) {
				let char;

				if (this.isFull(row, column)) {
					char = FULL;
				} else if (this.isOpen(row, column)) {
					char = EMPTY;
				} else {
					char = BLOCKED;
				}

				grid += `|${char}`;
			}
			grid += '|\n';
		}
		grid += separator;

		return grid;
	}
}

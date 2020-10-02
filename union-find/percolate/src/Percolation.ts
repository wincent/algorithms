import UnionFind from './UnionFind';

const BLOCKED = '🛑';
const EMPTY = '  ';
const FULL = '💧';

export default class Percolation {
	#bottom: number;
	#cells: Array<boolean>;
	#connections: UnionFind;
	#open: number;
	#size: number;
	#top: number;

	/**
	 * Creates n-by-n grid, with all sites initially blocked.
	 */
	constructor(size: number) {
		this.#cells = new Array(size * size).fill(false);
		this.#connections = new UnionFind(size * size + 2);
		this.#open = 0;
		this.#size = size;

		// Additional virtual sites for linking to at top and bottom.

		this.#bottom = this.#connections.size - 1;
		this.#top = this.#connections.size - 2;
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

		if (row === this.#size - 1) {
			this.#connections.union(index, this.#bottom);
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
		return (
			this.#connections.find(this.#top) ===
			this.#connections.find(this.#bottom)
		);
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

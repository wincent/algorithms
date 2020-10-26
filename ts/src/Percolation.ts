import UnionFind from './UnionFind';

export default class Percolation {
	_size: number;

	/**
	 * Creates n-by-n grid, with all sites initially blocked.
	 */
	constructor(size: number) {
		this._size = size;
	}

	/**
	 * Opens the site (row, column) if it is not open already.
	 */
	open(row: number, column: number) {
		// TODO...
	}

	/**
	 * Is the site (row, column) open?
	 */
	isOpen(row: number, column: number) {
		return false; // TODO
	}

	/**
	 * Is the site (row, column) full?
	 */
	isFull(row: number, column: number): boolean {
		return false; // TODO
	}

	/**
	 * Returns the number of open sites.
	 */
	numberOfOpenSites(): number {
		return 0; // TODO
	}

	/**
	 * Does the system percolate?
	 */
	percolates(): boolean {
		return true; // TODO
	}

	toString() {
		return ''; // TODO (optional, for debugging purposes)
	}
}

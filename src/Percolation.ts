import UnionFind from './UnionFind';

const BLOCKED = '🛑';
const EMPTY = '  ';
const FULL = '💧';

export default class Percolation {
	_cells: Array<boolean>;
	_connections: UnionFind;
	_lowest: Map<number, number>;
	_open: number;
	_percolates: boolean;
	_size: number;
	_top: number;

	/**
	 * Creates n-by-n grid, with all sites initially blocked.
	 */
	constructor(size: number) {
		this._cells = new Array(size * size);
		this._connections = new UnionFind(size * size + 1);
		this._lowest = new Map();
		this._open = 0;
		this._percolates = false;
		this._size = size;

		// Additional virtual site for linking to at top.

		this._top = this._connections.size - 1;
	}

	/**
	 * Convenience function that connects two sites and returns the
	 * lowest site in the neighbor's former leader.
	 */
	_connect(index: number, neighbor: number): number {
		const leader = this._connections.find(neighbor);

		this._connections.union(index, neighbor);

		return this._lowest.get(leader) || 0;
	}

	/**
	 * Opens the site (row, column) if it is not open already.
	 */
	open(row: number, column: number) {
		const index = row * this._size + column;

		if (this._cells[index]) {
			return true;
		}

		this._cells[index] = true;
		this._open++;

		// Keep track of lowest index seen so far.

		let lowest = index;

		// Link with open neighbors.

		if (row === 0) {
			lowest = Math.max(lowest, this._connect(index, this._top));
		}

		if (row > 0 && this.isOpen(row - 1, column)) {
			lowest = Math.max(
				lowest,
				this._connect(index, (row - 1) * this._size + column)
			);
		}

		if (row < this._size - 1 && this.isOpen(row + 1, column)) {
			lowest = Math.max(
				lowest,
				this._connect(index, (row + 1) * this._size + column)
			);
		}

		if (column > 0 && this.isOpen(row, column - 1)) {
			lowest = Math.max(
				lowest,
				this._connect(index, row * this._size + column - 1)
			);
		}

		if (column < this._size - 1 && this.isOpen(row, column + 1)) {
			lowest = Math.max(
				lowest,
				this._connect(index, row * this._size + column + 1)
			);
		}

		// Detect percolation.

		const leader = this._connections.find(index);

		this._lowest.set(leader, lowest);

		if (
			Math.floor(lowest / this._size) === this._size - 1 &&
			this.isFull(Math.floor(lowest / this._size), lowest % this._size)
		) {
			this._percolates = true;
		}
	}

	/**
	 * Is the site (row, column) open?
	 */
	isOpen(row: number, column: number) {
		return !!this._cells[row * this._size + column];
	}

	/**
	 * Is the site (row, column) full?
	 */
	isFull(row: number, column: number): boolean {
		const index = row * this._size + column;

		return (
			this._connections.find(index) === this._connections.find(this._top)
		);
	}

	/**
	 * Returns the number of open sites.
	 */
	numberOfOpenSites(): number {
		return this._open;
	}

	/**
	 * Does the system percolate?
	 */
	percolates(): boolean {
		return this._percolates;
	}

	toString() {
		let grid = '┏' + '━'.repeat(this._size * 2) + '┓\n';

		for (let row = 0; row < this._size; row++) {
			grid += '┃';

			for (let column = 0; column < this._size; column++) {
				if (this.isFull(row, column)) {
					grid += FULL;
				} else if (this.isOpen(row, column)) {
					grid += EMPTY;
				} else {
					grid += BLOCKED;
				}
			}
			grid += '┃\n';
		}
		grid += '┗' + '━'.repeat(this._size * 2) + '┛\n';

		return grid;
	}
}

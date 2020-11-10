const BLANK = 0;

export default class Board {
	_dimension: number;
	_empty: [number, number] | undefined;
	_hamming: number | undefined;
	_manhattan: number | undefined;
	_tiles: Array<Array<number>>;

	constructor(tiles: Array<Array<number>>) {
		this._dimension = tiles.length;

		if (tiles.some((row) => row.length !== this._dimension)) {
			throw new Error(
				`Expected board to be a ${this._dimension}-by-${this._dimension} grid`
			);
		}

		this._tiles = tiles;
	}

	/**
	 * Returns the board dimension, "n".
	 */
	dimension() {
		return this._dimension;
	}

	/**
	 * Does this board equal `other`?
	 */
	equals(other: unknown) {
		if (other === this) {
			return true;
		}

		if (other instanceof Board && other.dimension() === this.dimension()) {
			return this._tiles.every((row, i) => {
				return row.every((cell, j) => cell === other._tiles[i][j]);
			});
		}

		return false;
	}

	/**
	 * Returns the Hamming distance (number of tiles out of place).
	 */
	hamming() {
		if (this._hamming === undefined) {
			let distance = 0;

			const dimension = this.dimension();

			for (let i = 0; i < dimension; i++) {
				for (let j = 0; j < dimension; j++) {
					const actual = this._tiles[i][j];

					const expected = i * dimension + j + 1;

					if (actual !== BLANK && actual !== expected) {
						distance++;
					}
				}
			}

			this._hamming = distance;
		}

		return this._hamming;
	}

	/**
	 * Is this board the goal board?
	 */
	isGoal() {
		return this.hamming() === 0;
	}

	/**
	 * Returns the total Manhattan distances (sum of distances between
	 * tiles and goal).
	 */
	manhattan() {
		if (this._manhattan === undefined) {
			let distance = 0;

			const dimension = this.dimension();

			for (let i = 0; i < dimension; i++) {
				for (let j = 0; j < dimension; j++) {
					const actual = this._tiles[i][j];

					let expected = i * dimension + j + 1;

					if (actual !== BLANK && actual !== expected) {
						let expectedColumn;
						let expectedRow;

						expectedRow = Math.floor((actual - 1) / dimension);
						expectedColumn = (actual - 1) % dimension;

						distance +=
							Math.abs(expectedRow - i) +
							Math.abs(expectedColumn - j);
					}
				}
			}

			this._manhattan = distance;
		}

		return this._manhattan;
	}

	/**
	 * Returns the row, column tuple corresponding to the empty cell.
	 */
	empty(): [number, number] {
		if (this._empty === undefined) {
			outer: for (let i = 0; i < this._dimension; i++) {
				for (let j = 0; j < this._dimension; j++) {
					if (this._tiles[i][j] === 0) {
						this._empty = [i, j];
						break outer;
					}
				}
			}
		}

		return this._empty!;
	}

	/**
	 * All neighboring boards.
	 */
	neighbors(): Iterable<Board> {
		const [row, column] = this.empty();

		const swaps: Array<[number, number]> = [];

		if (row > 0) {
			swaps.push([row - 1, column]);
		}

		if (row < this._dimension - 1) {
			swaps.push([row + 1, column]);
		}

		if (column > 0) {
			swaps.push([row, column - 1]);
		}

		if (column < this._dimension - 1) {
			swaps.push([row, column + 1]);
		}

		const instance = this;

		return {
			*[Symbol.iterator]() {
				while (swaps.length) {
					yield instance._swap([row, column], swaps.pop()!);
				}
			},
		};
	}

	toString() {
		const maximum = this._dimension ** 2;

		const numberWidth = maximum.toString().length + 1;

		return (
			`${this._dimension}\n` +
			this._tiles
				.map((row) => {
					return row
						.map((value) => value.toString().padStart(numberWidth))
						.join('');
				})
				.join('\n')
		);
	}

	/**
	 * Returns a board that is obtained by exchanging any pair of tiles.
	 */
	twin(): Board {
		if (this._dimension < 2) {
			throw new Error('No twin exists for boards of size < 2');
		}

		// Find two non-empty cells to swap.
		const [a, b] = [
			[0, 0],
			[0, 1],
			[1, 0],
		]
			.filter(([row, col]) => {
				return this._tiles[row][col] !== 0;
			})
			.slice(0, 2) as any;

		return this._swap(a, b);
	}

	/**
	 * Returns a copy of the board with `from` and `to` swapped.
	 */
	_swap(
		[fromRow, fromColumn]: [number, number],
		[toRow, toColumn]: [number, number]
	): Board {
		const tiles: Array<Array<number>> = [];

		for (let i = 0; i < this._dimension; i++) {
			if (i !== fromRow && i !== toRow) {
				// Board is immutable so we can reuse unchanged rows.
				tiles.push(this._tiles[i]);
			} else {
				tiles.push(
					this._tiles[i].map((cell, j) => {
						if (i === fromRow && j === fromColumn) {
							return this._tiles[toRow][toColumn];
						} else if (i === toRow && j === toColumn) {
							return this._tiles[fromRow][fromColumn];
						} else {
							return cell;
						}
					})
				);
			}
		}

		return new Board(tiles);
	}
}

import MinPQ from './MinPQ';

import type Board from './Board';

type SearchNode = {
	board: Board;
	moves: number;
	previous: SearchNode | null;
};

let comparator = process.env.MANHATTAN
	? (a: SearchNode, b: SearchNode) => {
			const order =
				b.board.manhattan() + b.moves - (a.board.manhattan() + a.moves);

			return order === 0
				? b.board.hamming() + b.moves - (a.board.hamming() - a.moves)
				: order;
	  }
	: (a: SearchNode, b: SearchNode) => {
			return b.board.hamming() + b.moves - (a.board.hamming() - a.moves);
	  };

export default class Solver {
	_initial: Board;
	_moves: number | undefined;
	_queue: MinPQ<SearchNode>;
	_solution: SearchNode | null | undefined;

	constructor(initial: Board) {
		this._initial = initial;
		this._queue = new MinPQ(comparator);
		this._queue.insert({
			board: this._initial,
			moves: 0,
			previous: null,
		});
	}

	isSolvable() {
		return this.moves() !== -1;
	}

	moves() {
		if (this._moves === undefined) {
			const solution = this.solution();

			if (solution) {
				this._moves = [...solution].length - 1;
			} else {
				this._moves = -1;
			}
		}

		return this._moves;
	}

	solution(): Iterable<Board> | null {
		let next: SearchNode | null = null;

		if (this._solution === undefined) {
			// Detect unsolvable by checking parity.
			// See: https://stackoverflow.com/a/34570524/2103996
			// See: https://youtu.be/YI1WqYKHi78

			// Count inversions.
			const dimension = this._initial.dimension();
			const tiles = this._initial._tiles;
			let inversions = 0;

			for (let i = 0; i < dimension ** 2; i++) {
				for (let j = i + 1; j < dimension ** 2; j++) {
					const aRow = Math.floor(i / dimension);
					const aColumn = i % dimension;
					const bRow = Math.floor(j / dimension);
					const bColumn = j % dimension;
					const a = tiles[aRow][aColumn];
					const b = tiles[bRow][bColumn];

					if (a > b && b !== 0) {
						inversions++;
					}
				}
			}

			const [row] = this._initial.empty();

			const solvable =
				dimension % 2 === 0 // Even-sized grid?
					? row % 2 !== 0 // Blank is on odd row (from bottom)?
						? inversions % 2 === 0
						: inversions % 2 !== 0 // Blank is on even row (from bottom).
					: inversions % 2 === 0; // Odd-sized grid.

			if (!solvable) {
				this._solution = null;
			} else {
				while (true) {
					next = this._queue.extract() || null;

					if (!next || next.board.isGoal()) {
						break;
					}

					for (const neighbor of next.board.neighbors()) {
						// The "critical optimization"; don't revisit current node's
						// predecessor.
						if (!neighbor.equals(next.previous?.board)) {
							this._queue.insert({
								board: neighbor,
								moves: next.moves + 1,
								previous: next,
							});
						}
					}
				}

				this._solution = next;
			}
		}

		let move: SearchNode | null = this._solution;

		if (move) {
			// Reverse order.
			const moves: Array<Board> = [];

			while (move) {
				moves.unshift(move.board);

				move = move.previous;
			}

			moves.reverse();

			return {
				*[Symbol.iterator]() {
					while (moves.length) {
						yield moves.pop()!;
					}
				},
			};
		} else {
			return null;
		}
	}
}

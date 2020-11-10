import type Board from './Board';

export default class Solver {
	_initial: Board;

	constructor(initial: Board) {
		this._initial = initial;
	}

	isSolvable() {
		// TODO: replace with real implementation
		return [true, false][Math.round(Math.random())];
	}

	moves() {
		// TODO: replace with real implementation
		return 10;
	}

	solution(): Iterable<Board> {
		// TODO: replace with real implementation
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
}

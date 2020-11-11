module.exports = class Solver {
	constructor(initial) {
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

	solution() {
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
};

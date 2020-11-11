const assert = require('assert');
const fs = require('fs');

const Board = require('./Board');
const Solver = require('./Solver');

async function main() {
	assert(
		process.argv.length === 3,
		'Expected exactly one argument (an input file)'
	);

	const file = process.argv[2];

	const contents = fs
		.readFileSync(file, 'utf8')
		.trim()
		.split(/\r\n|\n/)
		.filter((line) => /\S/.test(line))
		.map((line) => line.trim());

	assert(contents.length, 'Expected a non-blank input file');

	const n = parseInt(contents[0], 10);

	assert(!isNaN(n), 'Expected first line to be a grid size');

	assert(contents.length === n + 1, `Expected ${n} rows of input data`);

	const tiles = Array.from({length: n}, () => []);

	for (let i = 0; i < n; i++) {
		const values = contents[i + 1].split(/\s+/);

		assert(values.length === n, `Expected row with ${n} items`);

		for (let j = 0; j < n; j++) {
			const value = parseInt(values[j], 10);

			assert(!isNaN(value), 'Expected row value to be an number');

			tiles[i][j] = value;
		}
	}

	const initial = new Board(tiles);

	const solver = new Solver(initial);

	if (solver.isSolvable()) {
		console.log(`Minimum number of moves = ${solver.moves()}`);

		for (const board of solver.solution()) {
			console.log(board);
		}
	} else {
		console.log('No solution possible');
	}
}

main().catch((error) => {
	console.error(`error: ${error}`);

	process.exit(1);
});

import {performance} from 'perf_hooks';

import Percolation from './Percolation';

/**
 * Usage:
 *
 *    node montecarlo.js [SIZE [RUNS]]
 *
 * Defaults:
 *
 *    SIZE = 20
 *    RUNS = 100
 *
 * Environment variables:
 *
 *    VERBOSE=2 - shows grid state after each step.
 *    VERBOSE=1 - (default)
 *    VERBOSE=0 - suppresses all output except for final summary.
 */

const RUNS = Number(process.argv[3]) || 100;
const SIZE = Number(process.argv[2]) || 20;
const VERBOSE = Number(process.env.VERBOSE || 1);

/**
 * Fisher-Yates "inside-out" variant.
 *
 * See: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
function shuffle(source: Array<unknown>) {
	const output = new Array(source.length);

	for (let i = 0; i < source.length; i++) {
		const j = Math.round(Math.random() * i);
		if (j !== i) {
			output[i] = output[j];
		}
		output[j] = source[i];
	}

	return output;
}

let totalOpenCells = 0;

let elapsed = 0;

for (let i = 0; i < RUNS; i++) {
	const randomIndices = shuffle([...Array(SIZE * SIZE).keys()]);

	const start = performance.now();

	const percolation = new Percolation(SIZE);

	for (let j = 0; j < randomIndices.length; j++) {
		const column = randomIndices[j] % SIZE;
		const row = Math.floor(randomIndices[j] / SIZE);

		percolation.open(row, column);

		if (percolation.percolates()) {
			if (VERBOSE > 0) {
				console.log(
					`🎉 Percolates after step ${j} (run ${i}): open row ${row}, column ${column} (threshold ${
						j / (SIZE * SIZE)
					})`
				);
				console.log(percolation.toString());
			}
			totalOpenCells += j;
			break;
		} else if (VERBOSE > 1) {
			console.log(
				`🔎 Step ${j} (run ${i}): open row ${row}, column ${column}`
			);
			console.log(percolation.toString());
		}
	}

	elapsed += performance.now() - start;
}

console.log(
	`Runs: ${RUNS}\n` +
		`Size: ${SIZE} * ${SIZE}\n` +
		`Total time: ${elapsed.toFixed(2)}ms (${(elapsed / RUNS).toFixed(
			2
		)}ms per run)\n` +
		`Threshhold: ${totalOpenCells / (SIZE * SIZE * RUNS)}`
);

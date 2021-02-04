import BinaryStdIn from './BinaryStdIn';
import CircularSuffixArray from './CircularSuffixArray';
import DynamicArray from './DynamicArray';
import {writeByte, writeInt} from './write';

import type {BinaryReadable, Writable} from './types';

const RADIX = 256;

/**
 * > Performance requirements.  The running time of your Burrows–Wheeler
 * > transform must be proportional to n + R (or better) in the worst case,
 * > excluding the time to construct the circular suffix array. The running
 * > time of your Burrows–Wheeler inverse transform must be proportional
 * > to n + R (or better) in the worst case. The amount of memory used by
 * > both the Burrows–Wheeler transform and inverse transform must be
 * > proportional to n + R (or better) in the worst case.
 */
export default class BurrowsWheeler {
	#stdin: BinaryReadable;
	#stdout: Writable;

	constructor(
		stdin: BinaryReadable = new BinaryStdIn(),
		stdout: Writable = process.stdout
	) {
		this.#stdin = stdin;
		this.#stdout = stdout;
	}

	inverseTransform() {
		// `I` in the original Burrows-Wheeler paper.
		//
		// Corresponds to the starting position.
		const I = this.#stdin.readInt();

		// `L` in the original Burrows-Wheeler paper.
		//
		// It corresponds to the last column in the matrix produced by the
		// transform.
		const L = this.#stdin.readString();

		const length = L.length;

		// `C` in the original Burrows-Wheeler paper.
		//
		// Holds count of characters in `L` preceding each character `ch` in the
		// alphabet.
		const C = new Array(RADIX).fill(0);

		// `P` in the original Burrows-Wheeler paper.
		//
		// `P[i]` is the number of instances of the character `L[i]` in the
		// prefix of `L` (ie. from 0 up to i - 1).
		const P = new Array(length);

		// `T` in the original Burrows-Wheeler paper.
		//
		// Tracks the connection between the original `matrix` (sorted
		// on first character) and the `matrix'` (sorted on second
		// character). That is, row `j` of `matrix'` corresponds to row
		// `T[j]` of `matrix`.
		const T = new Array(length);

		// `S` in the original Burrows-Wheeler paper.
		//
		// This is where we will reconstruct the original input.
		const S = new Array(length);

		for (let i = 0; i < length; i++) {
			P[i] = C[L[i]];
			C[L[i]] = C[L[i]] + 1;
		}

		let sum = 0;

		for (let i = 0; i < RADIX; i++) {
			sum += C[i];
			C[i] = sum - C[i];
		}

		for (let i = 0; i < length; i++) {
			T[i] = P[i] + C[L[i]];
		}

		let last = I;

		for (let i = 0; i < length; i++) {
			S[length - 1 - i] = L[last];
			last = T[last];
		}

		for (let i = 0; i < length; i++) {
			writeByte(S[i], this.#stdout);
		}
	}

	transform() {
		const buffer = new DynamicArray();

		while (!this.#stdin.isEmpty()) {
			buffer.push(this.#stdin.readChar());
		}

		const length = buffer.length;

		const storage = buffer.snapshot();

		const csa = new CircularSuffixArray(storage, length);

		let first = 0;

		for (let i = 0; i < length; i++) {
			if (!csa.index(i)) {
				first = i;
				break;
			}
		}

		writeInt(first, this.#stdout);

		for (let i = 0; i < length; i++) {
			const index = (length + csa.index(i) - 1) % length;

			writeByte(storage[index], this.#stdout);
		}
	}
}

function main() {
	if (process.argv.length !== 3) {
		throw new Error(
			'Expected exactly one argument ("-" to transform, or "+" to inverse transform)'
		);
	}

	const mode = process.argv[2];

	if (mode === '-') {
		new BurrowsWheeler().transform();
	} else if (mode === '+') {
		new BurrowsWheeler().inverseTransform();
	} else {
		throw new Error(
			`Expected "-" to transform or "+" to inverse transform, got ${JSON.stringify(
				mode
			)}`
		);
	}
}

if (require.main === module) {
	main();
}

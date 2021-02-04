import BinaryStdIn from './BinaryStdIn';
import {writeByte} from './write';

import type {BinaryReadable, Writable} from './types';

// TODO: add common superclass to handle this stdin/stdout stuff, if it ends up
// appearing in more places

const RADIX = 256;

/**
 * > Performance requirements.	The running time of both move-to-front
 * > encoding and decoding must be proportional to n R (or better) in
 * > the worst case and proportional to n + R (or better) on inputs that
 * > arise when compressing typical English text, where n is the number
 * > of characters in the input and R is the alphabet size. The amount
 * > of memory used by both move-to-front encoding and decoding must be
 * > proportional to n + R (or better) in the worst case.
 */
export default class MoveToFront {
	#stdin: BinaryReadable;
	#stdout: Writable;

	constructor(
		stdin: BinaryReadable = new BinaryStdIn(),
		stdout: Writable = process.stdout
	) {
		this.#stdin = stdin;
		this.#stdout = stdout;
	}

	get lookup() {
		return [...Array(RADIX).keys()];
	}

	decode() {
		const lookup = this.lookup;

		while (!this.#stdin.isEmpty()) {
			const code = this.#stdin.readChar();

			const char = lookup[code];

			writeByte(char, this.#stdout);

			// Move to front.
			for (let i = code; i > 0; i--) {
				lookup[i] = lookup[i - 1];
			}

			lookup[0] = char;
		}
	}

	encode() {
		const lookup = this.lookup;

		while (!this.#stdin.isEmpty()) {
			const char = this.#stdin.readChar();

			for (let i = 0; i < RADIX; i++) {
				if (lookup[i] === char) {
					writeByte(i, this.#stdout);

					// Move to front.
					for (let j = i; j > 0; j--) {
						lookup[j] = lookup[j - 1];
					}

					lookup[0] = char;

					break;
				}
			}
		}
	}
}

function main() {
	if (process.argv.length !== 3) {
		throw new Error(
			'Expected exactly one argument ("+" to decode, or "-" to encode)'
		);
	}

	const mode = process.argv[2];

	if (mode === '+') {
		new MoveToFront().decode();
	} else if (mode === '-') {
		new MoveToFront().encode();
	} else {
		throw new Error(
			`Expected "+" to decode or "-" to encode, got ${JSON.stringify(
				mode
			)}`
		);
	}
}

if (require.main === module) {
	main();
}

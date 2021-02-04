import BinaryStdIn from './BinaryStdIn';
import {writeByte} from './write';

import type {BinaryReadable, Writable} from './types';

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

	decode() {}

	encode() {}
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

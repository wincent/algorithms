import BinaryStdIn from './BinaryStdIn';

import type {BinaryReadable, Writable} from './types';

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

	inverseTransform() {}

	transform() {}
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

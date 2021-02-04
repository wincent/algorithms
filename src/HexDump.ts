import BinaryStdIn from './BinaryStdIn';

import type {BinaryReadable, Writable} from './types';

export default class HexDump {
	#stdin: BinaryReadable;
	#stdout: Writable;

	constructor(
		stdin: BinaryReadable = new BinaryStdIn(),
		stdout: Writable = process.stdout
	) {
		this.#stdin = stdin;
		this.#stdout = stdout;
	}

	dump(limit = 16) {
		let bytes = 0;

		while (!this.#stdin.isEmpty()) {
			const hex = this.#stdin.readChar().toString(16).padStart(2, '0');

			if (bytes === 0) {
				this.#stdout.write(hex);
			} else if (bytes % limit === 0) {
				this.#stdout.write(`\n${hex}`);
			} else {
				this.#stdout.write(` ${hex}`);
			}

			bytes++;
		}

		this.#stdout.write(`\n`);

		this.#stdout.write(`${bytes * 8} bits\n`);
	}
}

function main() {
	const limit =
		process.argv.length === 3 ? parseInt(process.argv[2], 10) : undefined;

	const hexDump = new HexDump();

	if (limit && !isNaN(limit)) {
		hexDump.dump(limit);
	} else {
		hexDump.dump();
	}
}

if (require.main === module) {
	main();
}

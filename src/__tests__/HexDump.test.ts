import fs from 'fs';
import path from 'path';

import HexDump from '../HexDump';
import BinarySource from '../BinarySource';

import type {Writable} from '../types';

describe('HexDump', () => {
	it('can dump a short string', () => {
		const output = dump('foobar');

		expect(output).toBe('66 6f 6f 62 61 72\n' + '48 bits\n');
	});

	it('takes an optional `limit` parameter', () => {
		const output = dump('foobar', 3);

		expect(output).toBe('66 6f 6f\n' + '62 61 72\n' + '48 bits\n');
	});

	it('defaults `limit` to 16 in the absence of an explicit value', () => {
		const output = dump('this time the text is a little longer');

		expect(output).toBe(
			'74 68 69 73 20 74 69 6d 65 20 74 68 65 20 74 65\n' +
				'78 74 20 69 73 20 61 20 6c 69 74 74 6c 65 20 6c\n' +
				'6f 6e 67 65 72\n' +
				'296 bits\n'
		);
	});

	it('can dump examples/abra.txt', () => {
		const output = dump(
			fs.readFileSync(
				path.join(__dirname, '..', '..', 'examples', 'abra.txt'),
				'utf8'
			)
		);

		// This is the output as shown at:
		// https://coursera.cs.princeton.edu/algs4/assignments/burrows/specification.php
		expect(output).toBe(
			'41 42 52 41 43 41 44 41 42 52 41 21\n' + '96 bits\n'
		);
	});
});

/**
 * Helper function to set up stdin-like and stdout-like stand-in objects to pipe
 * `source` string through the `HexDump` class and collect the output.
 */
function dump(source: string, limit?: number): string {
	const stdin = buffer(source);

	let output = '';

	const stdout: Writable = {
		write(text: string | Uint8Array) {
			if (typeof text === 'string') {
				output += text;
			} else {
				throw new Error('dump() helper only supports strings');
			}

			return true;
		},
	};

	const hexDump = new HexDump(stdin, stdout);

	if (typeof limit === 'undefined') {
		hexDump.dump();
	} else {
		hexDump.dump(limit);
	}

	return output;
}

/**
 * Helper function for building a stdin-like `BinarySource` object from
 * which to read the `source` string.
 */
function buffer(source: string): BinarySource {
	const array = new Uint8Array(source.length);

	for (let i = 0; i < source.length; i++) {
		array[i] = source.charCodeAt(i);
	}

	return new BinarySource(array);
}

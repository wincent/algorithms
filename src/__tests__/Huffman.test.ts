import fs from 'fs';
import path from 'path';

import Huffman from '../Huffman';
import BinarySource from '../BinarySource';

import type {Writable} from '../types';

describe('Huffman', () => {
	let source: string;

	beforeEach(() => {
		source = fs.readFileSync(
			path.join(__dirname, '..', '..', 'examples', 'abra.txt'),
			'utf8'
		);
	});

	it('compresses the example from the specification', () => {
		const compressed = huffman(source, (h) => {
			h.compress();
		});

		// Note that the specification shows:
		//
		//      50 4a 22 43 43 54 a8 40 00 00 01 8f 96 8f 94
		//      120 bits
		//
		// Whereas I output:
		//
		//      50 49 0d 49 42 51 28 60 00 00 01 8d 5e e6 a8
		//      120 bits
		//
		// We get different results, but the same compression ratio, because the
		// code table produced depends on the order in which equal-frequency
		// items come out of the priority queue. Compare their code table
		// from the slides:
		//
		//      character | frequency | encoding | encoded size
		//      ----------|-----------|----------| ------------
		//      A         | 5         |    0     | 5
		//      B         | 2         |  111     | 6
		//      C         | 1         | 1011     | 4
		//      D         | 1         |  100     | 3
		//      R         | 2         |  110     | 6
		//      !         | 1         | 1010     | 4
		//      -----------------------------------------------
		//                                 Total | 28 bits
		//
		// with mine:
		//
		//      character | frequency | encoding | encoded size
		//      ----------|-----------|----------| ------------
		//      A         | 5         |    0     | 5
		//      B         | 2         |  110     | 6
		//      C         | 1         | 1111     | 4
		//      D         | 1         | 1110     | 4
		//      R         | 2         |  101     | 6
		//      !         | 1         |  100     | 3
		//      -----------------------------------------------
		//                                 Total | 28 bits
		//
		// Both tally to 28 bits when encoded (120 bits total including
		// the trie and length metadata). See the round-trip for "proof"
		// that the encoding/decoding cycle isn't compromised by the
		// alternative code table.
		//
		expect(Array.from(Buffer.from(compressed, 'binary'))).toEqual([
			0x50,
			0x49,
			0x0d,
			0x49,
			0x42,
			0x51,
			0x28,
			0x60,
			0x00,
			0x00,
			0x01,
			0x8d,
			0x5e,
			0xe6,
			0xa8,
		]);
	});

	it('round-trips the example from the specification', () => {
		const compressed = huffman(source, (h) => {
			h.compress();
		});

		const expanded = huffman(compressed, (h) => {
			h.expand();
		});

		expect(expanded).toBe(source);
	});
});

/**
 * Helper function to set up stdin-like and stdout-like stand-in objects to pipe
 * `source` string through the `Huffman` class and collect the output.
 */
function huffman(source: string, callback: (h: Huffman) => void): string {
	const stdin = buffer(source);

	let output = '';

	// TODO: something common could be extracted here too, perhaps
	const stdout: Writable = {
		write(text: string | Uint8Array) {
			if (typeof text === 'string') {
				output += text;
			} else {
				for (let i = 0; i < text.length; i++) {
					output += String.fromCharCode(text[i]);
				}
			}

			return true;
		},
	};

	callback(new Huffman(stdin, stdout));

	return output;
}

// TODO: this is common, move it...

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

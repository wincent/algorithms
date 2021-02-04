import fs from 'fs';
import path from 'path';

import MoveToFront from '../MoveToFront';
import BinarySource from '../BinarySource';

import type {Writable} from '../types';

describe('MoveToFront', () => {
	let source: string;

	beforeEach(() => {
		source = fs.readFileSync(
			path.join(__dirname, '..', '..', 'examples', 'abra.txt'),
			'utf8'
		);
	});

	it('encodes the example from the specification', () => {
		const encoded = moveToFront(source, (mtf) => {
			mtf.encode();
		});

		// Specification shows:
		//
		// 41 42 52 02 44 01 45 01 04 04 02 26
		expect(Array.from(Buffer.from(encoded, 'binary'))).toEqual([
			0x41,
			0x42,
			0x52,
			0x02,
			0x44,
			0x01,
			0x45,
			0x01,
			0x04,
			0x04,
			0x02,
			0x26,
		]);
	});

	it('round-trips the example from the specification', () => {
		const encoded = moveToFront(source, (mtf) => {
			mtf.encode();
		});

		const decoded = moveToFront(encoded, (mtf) => {
			mtf.decode();
		});

		expect(decoded).toBe(source);
	});
});

/**
 * Helper function to set up stdin-like and stdout-like stand-in objects to pipe
 * `source` string through the `MoveToFront` class and collect the output.
 */
function moveToFront(
	source: string,
	callback: (mtf: MoveToFront) => void
): string {
	const stdin = buffer(source);

	let output = '';

	// TODO: something common could be extracted here too, perhaps
	const stdout: Writable = {
		write(text: string | Uint8Array) {
			output += text;
			return true;
		},
	};

	callback(new MoveToFront(stdin, stdout));

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

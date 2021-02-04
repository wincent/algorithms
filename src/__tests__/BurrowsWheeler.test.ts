import fs from 'fs';
import path from 'path';

import BurrowsWheeler from '../BurrowsWheeler';
import BinarySource from '../BinarySource';

import type {Writable} from '../types';

describe('BurrowsWheeler', () => {
	let source: string;

	beforeEach(() => {
		source = fs.readFileSync(
			path.join(__dirname, '..', '..', 'examples', 'abra.txt'),
			'utf8'
		);
	});

	it('transforms the example from the specification', () => {
		const transformed = burrowsWheeler(source, (bw) => {
			bw.transform();
		});

		// Specification shows:
		//
		// 00 00 00 03 41 52 44 21 52 43 41 41 41 41 42 42
		expect(Array.from(Buffer.from(transformed, 'binary'))).toEqual([
			0x00,
			0x00,
			0x00,
			0x03,
			0x41,
			0x52,
			0x44,
			0x21,
			0x52,
			0x43,
			0x41,
			0x41,
			0x41,
			0x41,
			0x42,
			0x42,
		]);
	});

	it('round-trips the example from the specification', () => {
		const transformed = burrowsWheeler(source, (bw) => {
			bw.transform();
		});

		const inverseTransformed = burrowsWheeler(transformed, (bw) => {
			bw.inverseTransform();
		});

		expect(inverseTransformed).toBe(source);
	});
});

/**
 * Helper function to set up stdin-like and stdout-like stand-in objects to pipe
 * `source` string through the `BurrowsWheeler` class and collect the output.
 */
function burrowsWheeler(
	source: string,
	callback: (bw: BurrowsWheeler) => void
): string {
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

	callback(new BurrowsWheeler(stdin, stdout));

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

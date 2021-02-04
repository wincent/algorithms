import type {Writable} from './types';

const byte = new Uint8Array(1);
const int = new Uint8Array(4);

/**
 * Helper function to make it easy to write a single byte to standard output.
 *
 * `process.stdout.write` accepts strings or buffer objects, but with
 * strings it does the following:
 *
 *  - "\x00" to "\x7f": writes out a single byte.
 *  - "\x80" to "\xff": writes out two bytes (ie. using UTF-16 encoding).
 *
 * So, as soon as we get above 7-bit ASCII we need to switch to a buffer-based
 * representation instead, which allows us to write a single raw byte.
 */
export function writeByte(value: number, writable: Writable) {
	if (value < 0 || value > 255) {
		throw new Error(`Value ${value} is out of range 0..255`);
	}

	if (value < 128) {
		writable.write(String.fromCharCode(value));
	} else {
		byte[0] = value;
		writable.write(byte);
	}
}

/**
 * Helper function to write a 32-bit integer.
 */
export function writeInt(value: number, writable: Writable) {
	if (value < 0 || value > 2 ** 32) {
		throw new Error(`Value ${value} is out of range 0..2**32`);
	}

	// Avoid platform endianness issues by emitting bytes in desired order.
	int[0] = (value & 0xff000000) >>> 24;
	int[1] = (value & 0x00ff0000) >>> 16;
	int[2] = (value & 0x0000ff00) >>> 8;
	int[3] = value & 0x000000ff;
	writable.write(int);
}

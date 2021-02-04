import fs from 'fs';

import DynamicArray from './DynamicArray';
import RingBuffer from './RingBuffer';
import pluralize from './pluralize';

import type {BinaryReadable} from './types';

const BUFFER_BYTES = 9;
const BUFFER_BITS = BUFFER_BYTES * 8;

export default class BinaryStdIn implements BinaryReadable {
	/**
	 * Buffer large enough to hold up to 72 bits (64 bits plus one byte of
	 * "overflow" corresponding to the last partially-read byte).
	 */
	#buffer: RingBuffer;

	/**
	 * File descriptor for standard input.
	 */
	#fd: number;

	/**
	 * True when there is no more data to read from standard input.
	 */
	#atEnd: boolean;

	constructor() {
		this.#buffer = new RingBuffer(BUFFER_BITS);
		this.#fd = process.stdin.fd;
		this.#atEnd = false;
	}

	/**
	 * "Pre-read" the specified number of bits into the buffer.
	 *
	 * Would be a real private method but TS doesn't support those yet
	 * (see: https://github.com/microsoft/TypeScript/issues/37677).
	 *
	 * Returns the number of bits actually read.
	 */
	_read(bits = 8): number {
		if (bits < 1 || bits > 64) {
			throw new Error(`Expected \`bits\` in range 1..64 but got ${bits}`);
		}

		let bytesToRead = Math.ceil(bits / 8);

		if (this.#buffer.size + bytesToRead * 8 > this.#buffer.capacity) {
			throw new Error(
				`Cannot read ${bits} ${pluralize(
					'bit',
					bits
				)} given buffer contents (${this.#buffer.size} ${pluralize(
					'bit',
					this.#buffer.size
				)})`
			);
		}

		let totalBytesRead = 0;

		while (bytesToRead > 0) {
			try {
				const data = new Uint8Array(8);

				// Where to start writing into buffer.
				const offset = 0;

				// Where in input to start reading (null = current position).
				const position = null;

				const read = fs.readSync(
					this.#fd,
					data,
					offset,
					bytesToRead,
					position
				);

				for (let i = 0; i < read; i++) {
					this.#buffer.push(data[i], 8);
				}

				bytesToRead -= read;
				totalBytesRead += read;

				if (read === 0) {
					this.#atEnd = true;
					break;
				}
			} catch (error) {
				if (error.code !== 'EAGAIN') {
					throw error;
				}
			}
		}

		return totalBytesRead;
	}

	close() {
		fs.closeSync(this.#fd);
	}

	isEmpty() {
		return !(this.#buffer.size || this._read());
	}

	readBoolean(): boolean {
		return !!this.readChar(1);
	}

	readChar(bits = 8): number {
		if (bits < 1 || bits > 8) {
			throw new Error(`Expected \`bits\` in range 1..8 but got ${bits}`);
		}

		const needed = bits - this.#buffer.size;

		if (needed > 0) {
			if (!this._read(needed)) {
				throw new Error(
					`Failed to read ${bits} ${pluralize('bit', bits)}`
				);
			}
		}

		return this.#buffer.shift(bits);
	}

	readInt(): number {
		let needed = 32 - this.#buffer.size;

		if (!this._read(needed)) {
			throw new Error('Failed to read 32 bits');
		}

		// JS bitwise operators (except >>>) convert to two's complement
		// representation, so we have to force things back to signed at
		// the end with (`>>> 0`).
		return (
			((this.#buffer.shift(8) << 24) |
				(this.#buffer.shift(8) << 16) |
				(this.#buffer.shift(8) << 8) |
				this.#buffer.shift(8)) >>>
			0
		);
	}

	readString(): Uint8Array {
		const array = new DynamicArray();

		while (!this.isEmpty()) {
			array.push(this.readChar());
		}

		return array.snapshot();
	}
}

import DynamicArray from './DynamicArray';
import RingBuffer from './RingBuffer';
import pluralize from './pluralize';

import type {BinaryReadable} from './types';

/**
 * Substitute for the `BinaryStdIn` class, for use in tests.
 */
export default class BinarySource implements BinaryReadable {
	/**
	 * We don't really need a circular buffer here because we know the size
	 * ahead of time, but `RingBuffer` gives us convenient bitwise access.
	 */
	#buffer: RingBuffer;

	constructor(content: Uint8Array) {
		this.#buffer = new RingBuffer(content.length * 8);

		for (let i = 0; i < content.length; i++) {
			this.#buffer.push(content[i], 8);
		}
	}

	close() {
		// No-op.
	}

	isEmpty() {
		return !this.#buffer.size;
	}

	readBoolean(): boolean {
		return !!this.readChar(1);
	}

	readChar(bits = 8): number {
		if (bits < 1 || bits > 8) {
			throw new Error(`Expected \`bits\` in range 1..8 but got ${bits}`);
		}

		if (bits > this.#buffer.size) {
			throw new Error(`Failed to read ${bits} ${pluralize('bit', bits)}`);
		}

		return this.#buffer.shift(bits);
	}

	readInt(): number {
		if (32 > this.#buffer.size) {
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

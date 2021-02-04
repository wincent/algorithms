import RingBuffer from './RingBuffer';

import type {Writable} from './types';

export default class BinaryStdOut implements Writable {
	#buffer: RingBuffer;
	#byte: Uint8Array;
	#closed: boolean;
	#writable: Writable;

	constructor(writable: Writable) {
		// Abuse RingBuffer because it handles bitwise manipulation for us.
		this.#buffer = new RingBuffer(16);
		this.#byte = new Uint8Array(1);
		this.#closed = false;
		this.#writable = writable;
	}

	close() {
		if (this.#closed) {
			throw new Error('Cannot close already-closed BinaryStdOut');
		}

		while (this.#buffer.size) {
			const size = this.#buffer.size;

			const byte = this.#buffer.shift(Math.min(8, size));

			if (size === 8) {
				this._write(byte);
			} else {
				// Make sure bits are as far left as possible.
				this._write(byte << (8 - size));
			}
		}

		this.#closed = true;
	}

	write(str: Uint8Array | string): boolean {
		if (this.#closed) {
			return false;
		} else if (this.#buffer.size) {
			let wrote = false;

			if (typeof str === 'string') {
				for (let i = 0; i < str.length; i++) {
					wrote = this.writeByte(str[i].charCodeAt(0));
				}
			} else {
				for (let i = 0; i < str.length; i++) {
					wrote = this.writeByte(str[i]);
				}
			}

			return wrote;
		} else {
			return this.#writable.write(str);
		}
	}

	writeBoolean(bit: boolean): boolean {
		if (this.#closed) {
			return false;
		} else {
			if (this.#buffer.size >= 8) {
				this._write(this.#buffer.shift(8));
			}

			this.#buffer.push(bit ? 1 : 0, 1);

			return true;
		}
	}

	writeByte(byte: number): boolean {
		if (!this.#buffer.size) {
			return this._write(byte);
		}

		while (this.#buffer.size >= 8) {
			this._write(this.#buffer.shift(8));
		}

		this.#buffer.push(byte, 8);

		return this._write(this.#buffer.shift(8));
	}

	writeInt(value: number): boolean {
		return (
			this.writeByte((value & 0xff000000) >>> 24),
			this.writeByte((value & 0x00ff0000) >>> 16),
			this.writeByte((value & 0x0000ff00) >>> 8),
			this.writeByte((value & 0x000000ff) >>> 0)
		);
	}

	_write(byte: number): boolean {
		if (this.#closed) {
			return false;
		}

		this.#byte[0] = byte;

		return this.#writable.write(this.#byte);
	}
}

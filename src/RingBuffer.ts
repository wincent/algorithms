const BITMASK = [
	0b00000000,
	0b10000000,
	0b11000000,
	0b11100000,
	0b11110000,
	0b11111000,
	0b11111100,
	0b11111110,
	0b11111111,
];

/**
 * We can't just use `~BITMASK[index]` to invert a bitmask because JS
 * will convert it into a 32-bit integer in two's complement format (ie.
 * -(x + 1)).
 */
const INVERSE_BITMASK = [
	0b11111111,
	0b01111111,
	0b00111111,
	0b00011111,
	0b00001111,
	0b00000111,
	0b00000011,
	0b00000001,
	0b00000000,
];

function debug(a: number | Uint8Array): string {
	if (typeof a === 'number') {
		return a.toString(2).padStart(8, '0');
	} else {
		const accumulator: Array<string> = [];

		return a
			.reduce((accumulator, byte) => {
				accumulator.push(debug(byte));

				return accumulator;
			}, accumulator)
			.join(' ');
	}
}

/**
 * A fixed-sized ring buffer specialized for bitwise operations.
 */
export default class RingBuffer {
	/**
	 * Capacity in bits.
	 */
	#capacity: number;

	/**
	 * Number of bits currently in the buffer.
	 */
	#size: number;

	/**
	 * Bit position within the ring buffer that corresponds to the first bit.
	 */
	#startIndex: number;

	/**
	 * Bit position within the ring buffer immediately after the last bit.
	 */
	#endIndex: number;

	/**
	 * Underlying storage that holds bit values.
	 */
	#storage: Uint8Array;

	constructor(capacity: number) {
		if (capacity < 1) {
			throw new Error(
				`RingBuffer: capacity must be positive (got ${capacity})`
			);
		}

		if (capacity % 8 !== 0) {
			throw new Error(
				`RingBuffer: capacity must be a multiple of 8 (got ${capacity})`
			);
		}

		this.#capacity = capacity;
		this.#size = 0;
		this.#storage = new Uint8Array(capacity / 8);
		this.#startIndex = 0;
		this.#endIndex = 0;
	}

	/**
	 * Given a bit position (`index`) and a `count` of bits starting at
	 * that index, returns the byte numbers and bitmask indices
	 * required to target the corresponding bits.
	 *
	 * For example, given these bits, and an index of "2" and count of "7":
	 *
	 *      |<------ byte 0 ------>||<----- byte 0 ------>|
	 *      0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
	 *            ^
	 *            |<--- count 7 --->|
	 *            index
	 *
	 * We would return:
	 *
	 * - `leftIndex`: (byte) 0
	 * - `rightIndex`: (byte) 1
	 * - `leftOffset`: 2 (ie. corresponding to a bitmask of 0x11000000)
	 * - `rightOffset`: 1 (ie. corresponding to a bitmask of 0x10000000)
	 */
	_getIndicesAndOffsets(index: number, count: number) {
		const leftIndex = Math.floor(index / 8);
		const leftOffset = index % 8;
		const rightIndex = Math.floor(((index + count) % this.#capacity) / 8);
		const rightOffset = (index + count) % 8;

		return {
			leftIndex,
			leftOffset,
			rightIndex: rightOffset ? rightIndex : leftIndex,
			rightOffset,
		};
	}

	/**
	 * Pushes a `value` of between 1 and 8 `bits` onto the end of the ring
	 * buffer.
	 */
	push(value: number, bits: number) {
		if (bits < 1 || bits > 8 || value < 0 || value > 255) {
			throw new Error(
				`RingBuffer: expected \`bits\` in range 1..8 and \`value\` in range 0..255, got ${bits}, ${value}`
			);
		}

		if (value > 2 ** bits - 1) {
			throw new Error(
				`RingBuffer: \`value\` (${value}) too large for \`bits\` (${bits})`
			);
		}

		if (this.#size + bits > this.#capacity) {
			throw new Error(
				`RingBuffer: capacity exceeded (capacity=${
					this.#capacity
				}, size=${this.#size}, pushing=${bits})`
			);
		}

		const {
			leftIndex,
			leftOffset,
			rightIndex,
			rightOffset,
		} = this._getIndicesAndOffsets(this.#endIndex, bits);

		if (leftIndex == rightIndex) {
			this.#storage[leftIndex] =
				(this.#storage[leftIndex] & BITMASK[leftOffset]) |
				((value << (8 - leftOffset - bits)) &
					INVERSE_BITMASK[leftOffset]);
		} else {
			this.#storage[leftIndex] =
				(this.#storage[leftIndex] & BITMASK[leftOffset]) |
				(value >> rightOffset);

			this.#storage[rightIndex] =
				(this.#storage[rightIndex] & INVERSE_BITMASK[rightOffset]) |
				((value & INVERSE_BITMASK[8 - rightOffset]) <<
					(8 - rightOffset));
		}

		this.#endIndex = (this.#endIndex + bits) % this.#capacity;
		this.#size += bits;
	}

	/**
	 * Shifts between 1 and 8 `bits` from the front of the ring buffer.
	 */
	shift(bits: number) {
		if (bits < 1 || bits > 8) {
			throw new Error(
				`RingBuffer: expected \`bits\` in range 1..8, got ${bits}`
			);
		}

		if (this.#size < bits) {
			throw new Error(
				`RingBuffer: cannot shift (bits=${bits}, size=${this.#size})`
			);
		}

		const {
			leftIndex,
			leftOffset,
			rightIndex,
			rightOffset,
		} = this._getIndicesAndOffsets(this.#startIndex, bits);

		let result = 0;

		if (rightIndex === leftIndex) {
			result =
				(this.#storage[leftIndex] & INVERSE_BITMASK[leftOffset]) >>
				(rightOffset ? 8 - rightOffset : 0);
		} else {
			result =
				(this.#storage[rightIndex] & BITMASK[rightOffset]) >>
				(8 - rightOffset);
			result |=
				(this.#storage[leftIndex] & INVERSE_BITMASK[leftOffset]) <<
				rightOffset;
		}

		this.#startIndex = (this.#startIndex + bits) % this.#capacity;
		this.#size -= bits;

		return result;
	}

	get capacity() {
		return this.#capacity;
	}

	get size() {
		return this.#size;
	}

	/**
	 * For debugging.
	 */
	get __storage() {
		return this.#storage;
	}
}

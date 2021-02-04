const RADIX = 256;

export default class CircularSuffixArray {
	#length: number;
	#indices: Array<number>;
	#source: Uint8Array;

	/**
	 * As a convenience (for testing, and debugging purposes), we accept string
	 * input as well, converting it to a Uint8Array.
	 *
	 * > Performance requirements: On typical English text, your data
	 * > type must use space proportional to n + R (or better) and the
	 * > constructor must take time proportional to n log n (or better). The
	 * > methods length() and index() must take constant time in the worst
	 * > case.
	 *
	 * Note the use of LSD radix sort here fails to meet that requirement. I
	 * chose it because it was easy to implement, but MSD radix sort probably
	 * would have been better, and 3-way radix quicksort would likely have been
	 * better still.
	 */
	constructor(input: Uint8Array | string, length = input.length) {
		if (typeof input === 'string') {
			this.#source = new Uint8Array(input.length);

			for (let i = 0; i < input.length; i++) {
				this.#source[i] = input.charCodeAt(i);
			}
		} else {
			this.#source = input;
		}

		const source = this.#source;

		this.#length = length;

		// Use LSD radix sort to sort the suffixes, but instead of
		// actually materializing the circular suffixes we use a `key()`
		// helper function to lookup which characters would exist at
		// each index.

		const suffixes: Array<number> = [...Array(length).keys()];
		const counts = Array(RADIX);

		// Returns the byte value at position `i` within suffix number `j`.
		function key(i: number, j: number) {
			return source[(i + suffixes[j]) % length];
		}

		for (let i = length - 1; i >= 0; i--) {
			counts.fill(0);

			for (let j = 0; j < length; j++) {
				counts[key(i, j)]++;
			}

			let total = 0;

			for (let j = 0; j < RADIX; j++) {
				[counts[j], total] = [total, counts[j] + total];
			}

			const output = Array(length);

			for (let j = 0; j < length; j++) {
				output[counts[key(i, j)]] = suffixes[j];
				counts[key(i, j)] += 1;
			}

			for (let j = 0; j < length; j++) {
				suffixes[j] = output[j];
			}
		}

		this.#indices = suffixes;
	}

	/**
	 * Returns index of ith sorted suffix.
	 */
	index(i: number): number {
		if (i < 0 || i > this.#length - 1) {
			throw new Error(`Requested index ${i} is out of bounds`);
		}

		return this.#indices[i];
	}

	toString() {
		let input = '';

		for (let i = 0; i < this.#length; i++) {
			input += String.fromCharCode(this.#source[i]);
		}

		return this.#indices
			.map((index) => {
				const left = input.substr(0, index);
				const right = input.substr(index);
				const letters = (right + left).split('').join(' ');

				return `${letters}   ${index}`;
			})
			.join('\n');
	}

	get length() {
		return this.#length;
	}
}

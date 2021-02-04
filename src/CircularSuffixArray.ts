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
	 * Originally we used LSD radix sort here even though it fails
	 * to meet that requirement. I chose it because it was easy to
	 * implement, but MSD radix sort probably would have been better,
	 * and 3-way radix quicksort would be better still; except for very
	 * large inputs, where a stack overflow may ocurr during recursion
	 * because most JS engines don't implement tail call optimization:
	 *
	 * https://2ality.com/2015/06/tail-call-optimization.html
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

		// Use 3-way radix quicksort to sort the suffixes, but instead of
		// actually materializing the circular suffixes we use a `key()`
		// helper function to lookup which characters would exist at
		// each index.

		const suffixes: Array<number> = [...Array(length).keys()];

		// Returns the byte value at position `i` within suffix number `j`.
		function key(i: number, j: number) {
			if (i >= suffixes.length) {
				return -1;
			}
			return source[(i + suffixes[j]) % length];
		}

		function exchange(a: number, b: number) {
			const tmp = suffixes[a];
			suffixes[a] = suffixes[b];
			suffixes[b] = tmp;
		}

		function sort(low: number, high: number, d: number) {
			if (high <= low) {
				return;
			}
			let less = low;
			let greater = high;
			const v = key(d, low);
			let i = low + 1;
			while (i <= greater) {
				const t = key(d, i);
				if (t < v) {
					exchange(less++, i++);
				} else if (t > v) {
					exchange(i, greater--);
				} else {
					i++;
				}
			}
			sort(low, less - 1, d);
			if (v >= 0) {
				sort(less, greater, d + 1);
			}
			sort(greater + 1, high, d);
		}

		sort(0, suffixes.length - 1, 0);

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

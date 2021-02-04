import CircularSuffixArray from '../CircularSuffixArray';

describe('CircularSuffixArray', () => {
	let csa: CircularSuffixArray;

	const input = 'ABRACADABRA!';

	beforeEach(() => {
		const array = new Uint8Array(input.length);

		for (let i = 0; i < input.length; i++) {
			array[i] = input.charCodeAt(i);
		}

		csa = new CircularSuffixArray(array);
	});

	it('matches the example from the specification', () => {
		// prettier-ignore
		expect(csa.toString()).toEqual(
			'! A B R A C A D A B R A   11\n' +
			'A ! A B R A C A D A B R   10\n' +
			'A B R A ! A B R A C A D   7\n' +
			'A B R A C A D A B R A !   0\n' +
			'A C A D A B R A ! A B R   3\n' +
			'A D A B R A ! A B R A C   5\n' +
			'B R A ! A B R A C A D A   8\n' +
			'B R A C A D A B R A ! A   1\n' +
			'C A D A B R A ! A B R A   4\n' +
			'D A B R A ! A B R A C A   6\n' +
			'R A ! A B R A C A D A B   9\n' +
			'R A C A D A B R A ! A B   2'
		);
	});

	describe('constructor()', () => {
		it('also accepts string input', () => {
			csa = new CircularSuffixArray(input);

			// prettier-ignore
			expect(csa.toString()).toEqual(
				'! A B R A C A D A B R A   11\n' +
				'A ! A B R A C A D A B R   10\n' +
				'A B R A ! A B R A C A D   7\n' +
				'A B R A C A D A B R A !   0\n' +
				'A C A D A B R A ! A B R   3\n' +
				'A D A B R A ! A B R A C   5\n' +
				'B R A ! A B R A C A D A   8\n' +
				'B R A C A D A B R A ! A   1\n' +
				'C A D A B R A ! A B R A   4\n' +
				'D A B R A ! A B R A C A   6\n' +
				'R A ! A B R A C A D A B   9\n' +
				'R A C A D A B R A ! A B   2'
			);
		});

		it('takes an optional `length`', () => {
			// This allows us to allocate a large Uint8Array buffer, partially
			// fill it, and initialize a CircularSuffixArray with that subset.
			csa = new CircularSuffixArray(input, 7);

			// prettier-ignore
			expect(csa.toString()).toEqual(
				'A B R A C A D   0\n' +
				'A C A D A B R   3\n' +
				'A D A B R A C   5\n' +
				'B R A C A D A   1\n' +
				'C A D A B R A   4\n' +
				'D A B R A C A   6\n' +
				'R A C A D A B   2'
			);
		});
	});

	describe('index()', () => {
		it('looks up index of "ith" sorted suffix', () => {
			expect(csa.index(0)).toBe(11);
			expect(csa.index(3)).toBe(0);
			expect(csa.index(8)).toBe(4);
			expect(csa.index(11)).toBe(2);
		});

		it('complains about out-of-bounds values', () => {
			expect(() => csa.index(-1)).toThrow(/out of bounds/);
			expect(() => csa.index(12)).toThrow(/out of bounds/);
		});
	});

	describe('length', () => {
		it('indicates the length of the original input', () => {
			expect(csa.length).toBe(12);
		});
	});
});

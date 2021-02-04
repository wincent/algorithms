import RingBuffer from '../RingBuffer';

describe('RingBuffer', () => {
	let buffer: RingBuffer;

	beforeEach(() => {
		buffer = new RingBuffer(24);
	});

	it('requires capacity to be a multiple of 8', () => {
		expect(() => new RingBuffer(4)).toThrow(/multiple of 8/);
	});

	it('requires capacity to be positive', () => {
		expect(() => new RingBuffer(-8)).toThrow(/positive/);
	});

	it('starts off empty', () => {
		expect(buffer.size).toBe(0);
	});

	it('updates size as bits are pushed', () => {
		buffer.push(1, 1);

		expect(buffer.size).toBe(1);

		buffer.push(10, 4);

		expect(buffer.size).toBe(5);
	});

	describe('push()', () => {
		it('complains if `value` or `bits` or out of range', () => {
			expect(() => buffer.push(1, 0)).toThrow('in range 1..8');
			expect(() => buffer.push(512, 9)).toThrow('in range 1..8');
			expect(() => buffer.push(-1, 4)).toThrow('in range 0..255');
			expect(() => buffer.push(256, 8)).toThrow('in range 0..255');
		});

		it('complains if `value` is too large for `bits`', () => {
			expect(() => buffer.push(16, 4)).toThrow('too large');
		});

		it('complains if the capacity of the buffer is exceeded', () => {
			for (let i = 0; i < 3; i++) {
				buffer.push(1, 8);
			}

			expect(() => buffer.push(1, 8)).toThrow('capacity exceeded');
		});
	});

	describe('shift()', () => {
		it('complains if `bits` is out of range', () => {
			expect(() => buffer.shift(0)).toThrow('in range 1..8');
			expect(() => buffer.shift(9)).toThrow('in range 1..8');
		});

		it('complains if `bits` exceeds current size of buffer', () => {
			expect(() => buffer.shift(3)).toThrow('cannot shift');

			buffer.push(1, 6);

			expect(() => buffer.shift(2)).not.toThrow();
		});
	});

	it('pushes and shifts whole bytes', () => {
		buffer.push(35, 8);
		buffer.push(169, 8);
		buffer.push(88, 8);

		expect(buffer.shift(8)).toBe(35);
		expect(buffer.shift(8)).toBe(169);
		expect(buffer.shift(8)).toBe(88);
	});

	it('pushes and shifts bits', () => {
		buffer.push(1, 1);
		buffer.push(0, 1);
		buffer.push(0, 1);
		buffer.push(1, 1);
		buffer.push(1, 1);
		buffer.push(1, 1);
		buffer.push(0, 1);
		buffer.push(1, 1);

		expect(buffer.shift(1)).toBe(1);
		expect(buffer.shift(1)).toBe(0);
		expect(buffer.shift(1)).toBe(0);
		expect(buffer.shift(1)).toBe(1);
		expect(buffer.shift(1)).toBe(1);
		expect(buffer.shift(1)).toBe(1);
		expect(buffer.shift(1)).toBe(0);
		expect(buffer.shift(1)).toBe(1);
	});

	it('pushes and shifts the example from the course slides', () => {
		// The date 12/31/1999 broken into 4 bits for day, 5 for
		// month, and 12 for year.
		buffer.push(12, 4);
		buffer.push(31, 5);

		// Note our API only lets us push 8 bits at a time, so we do the year in two
		// operations. (Would be pretty easy to remove this limitation.)
		buffer.push(7, 4);
		buffer.push(207, 8);

		// Proof that I got my math right:
		expect((7 << 8) + 207).toBe(1999);

		expect(buffer.shift(4)).toBe(12);
		expect(buffer.shift(5)).toBe(31);
		expect(buffer.shift(4)).toBe(7);
		expect(buffer.shift(8)).toBe(207);
	});

	it('wraps around at the end of the buffer (byte-wise)', () => {
		buffer.push(212, 8);
		buffer.push(100, 8);
		buffer.push(58, 8);

		// Buffer is now exactly full.
		expect(buffer.size).toBe(24);

		expect(buffer.shift(8)).toBe(212);
		expect(buffer.shift(8)).toBe(100);

		// Now wrap around back to start.
		buffer.push(97, 8);
		buffer.push(3, 8);

		expect(buffer.shift(8)).toBe(58);
		expect(buffer.shift(8)).toBe(97);
		expect(buffer.shift(8)).toBe(3);
	});

	it('wraps around at the end of the buffer (bit-wise)', () => {
		buffer.push(100, 8);
		buffer.push(200, 8);
		buffer.push(10, 4);

		// Buffer is 4 bits away from full, so free some space.
		expect(buffer.shift(8)).toBe(100);

		// This byte will be 4 bits at the end and 4 at the start.
		buffer.push(231, 8);

		expect(buffer.shift(8)).toBe(200);
		expect(buffer.shift(4)).toBe(10);
		expect(buffer.shift(8)).toBe(231);
	});
});

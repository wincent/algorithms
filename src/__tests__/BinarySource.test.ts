import BinarySource from '../BinarySource';

describe('BinarySource', () => {
	describe('readInt()', () => {
		let bs: BinarySource;

		beforeEach(() => {
			const contents = new Uint8Array(4);

			contents[0] = 0xfe;
			contents[1] = 0xed;
			contents[2] = 0xfa;
			contents[3] = 0xce;

			bs = new BinarySource(contents);
		});

		it('can read a 32-bit integer', () => {
			expect(bs.readInt()).toBe(0xfeedface);
		});

		it('complains when asked to read too much', () => {
			bs.readInt();

			expect(() => bs.readInt()).toThrow('Failed to read');
		});
	});
});

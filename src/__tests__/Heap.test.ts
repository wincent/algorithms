import Heap from '../Heap';

describe('Heap', () => {
	let heap: Heap<number>;

	describe('a min-heap', () => {
		beforeEach(() => {
			heap = new Heap<number>((a: number, b: number) => b - a);
		});

		it('starts off empty', () => {
			expect(heap.extract()).toBe(undefined);
			expect(heap.size).toBe(0);
		});

		it('can extract an item when non-empty', () => {
			heap.insert(10);
			expect(heap.size).toBe(1);

			expect(heap.extract()).toBe(10);
			expect(heap.size).toBe(0);
		});

		it('is empty after extracting last item', () => {
			heap.insert(10);
			heap.extract();
			expect(heap.extract()).toBe(undefined);
		});

		it('extracts the smallest items first', () => {
			heap.insert(20);
			heap.insert(120);
			heap.insert(20);
			heap.insert(40);
			heap.insert(60);
			heap.insert(10);

			expect(heap.extract()).toBe(10);
			expect(heap.extract()).toBe(20);
			expect(heap.extract()).toBe(20);
			expect(heap.extract()).toBe(40);

			// Interleave some inserts.
			heap.insert(5);
			heap.insert(200);

			expect(heap.extract()).toEqual(5);
			expect(heap.extract()).toEqual(60);
			expect(heap.extract()).toEqual(120);
			expect(heap.extract()).toEqual(200);

			// Ends up empty.
			expect(heap.extract()).toBe(undefined);
		});
	});

	describe('a max-heap', () => {
		beforeEach(() => {
			heap = new Heap<number>((a: number, b: number) => a - b);
		});

		it('starts off empty', () => {
			expect(heap.extract()).toBe(undefined);
		});

		it('extracts the largest items first', () => {
			heap.insert(10);
			heap.insert(20);
			heap.insert(120);
			heap.insert(20);
			heap.insert(40);
			heap.insert(60);
			heap.insert(10);

			expect(heap.extract()).toBe(120);
			expect(heap.extract()).toBe(60);
			expect(heap.extract()).toBe(40);
			expect(heap.extract()).toBe(20);

			// Interleave some inserts.
			heap.insert(5);
			heap.insert(200);

			expect(heap.extract()).toBe(200);
			expect(heap.extract()).toBe(20);
			expect(heap.extract()).toBe(10);
			expect(heap.extract()).toBe(10);
			expect(heap.extract()).toBe(5);

			// Ends up empty.
			expect(heap.extract()).toBe(undefined);
		});
	});

	describe('a heap with a "novel" comparison function', () => {
		it('behaves like a priority queue', () => {
			// A heap with a "novel" comparison function (ie. uses insertion
			// order as a tie-breaker, which is something you would
			// typically want in an actual priority queue).
			const pq = new Heap<{rank: number; value: number}>(
				(
					a: {rank: number; value: number},
					b: {rank: number; value: number}
				) => {
					if (a.value !== b.value) {
						return b.value - a.value;
					} else {
						// Tie-break on rank.
						return b.rank - a.rank;
					}
				}
			);

			let timestamp = 0;

			pq.insert({value: 50, rank: timestamp++});
			pq.insert({value: 10, rank: timestamp++});
			pq.insert({value: 75, rank: timestamp++});
			pq.insert({value: 50, rank: timestamp++});
			pq.insert({value: 75, rank: timestamp++});

			// Extracts the smallest item (10).
			expect(pq.extract()).toEqual({value: 10, rank: 1});

			// Tiebreaks using rank (50, rank 0).
			expect(pq.extract()).toEqual({value: 50, rank: 0});

			// Extracts the smallest item (50).
			expect(pq.extract()).toEqual({value: 50, rank: 3});

			// Tiebreaks using rank (75, rank 2).
			expect(pq.extract()).toEqual({value: 75, rank: 2});

			// Extracts the smallest item (75).
			expect(pq.extract()).toEqual({value: 75, rank: 4});
		});
	});
});

import assert from 'assert';

import Heap from './Heap';

//
// Test min heap.
//

let heap = new Heap<number>((a: number, b: number) => b - a);

assert.strictEqual(heap.extract(), undefined, 'Heap starts off empty');

heap.insert(10);

assert.equal(heap.extract(), 10, 'Can extract an item');

assert.strictEqual(heap.extract(), undefined, 'Heap is empty after extraction');

heap.insert(20);
heap.insert(120);
heap.insert(20);
heap.insert(40);
heap.insert(60);
heap.insert(10);

assert.equal(heap.extract(), 10, 'Extracts smallest item (10)');
assert.equal(heap.extract(), 20, 'Extracts smallest item (20)');
assert.equal(heap.extract(), 20, 'Extracts smallest item (20)');
assert.equal(heap.extract(), 40, 'Extracts smallest item (40)');

// Interleave some inserts.

heap.insert(5);
heap.insert(200);

assert.equal(heap.extract(), 5, 'Extracts smallest item (5)');
assert.equal(heap.extract(), 60, 'Extracts smallest item (60)');
assert.equal(heap.extract(), 120, 'Extracts smallest item (120)');
assert.equal(heap.extract(), 200, 'Extracts smallest item (200)');

assert.strictEqual(heap.extract(), undefined, 'Heap ends up empty');

//
// Test max heap.
//

heap = new Heap<number>((a: number, b: number) => a - b);

assert.strictEqual(heap.extract(), undefined, 'Heap starts off empty');

heap.insert(10);
heap.insert(20);
heap.insert(120);
heap.insert(20);
heap.insert(40);
heap.insert(60);
heap.insert(10);

assert.equal(heap.extract(), 120, 'Extracts largest item (120)');
assert.equal(heap.extract(), 60, 'Extracts largest item (60)');
assert.equal(heap.extract(), 40, 'Extracts largest item (40)');
assert.equal(heap.extract(), 20, 'Extracts largest item (20)');

// Interleave some inserts.

heap.insert(5);
heap.insert(200);

assert.equal(heap.extract(), 200, 'Extracts largest item (200)');
assert.equal(heap.extract(), 20, 'Extracts largest item (20)');
assert.equal(heap.extract(), 10, 'Extracts largest item (10)');
assert.equal(heap.extract(), 10, 'Extracts largest item (10)');
assert.equal(heap.extract(), 5, 'Extracts largest item (5)');

assert.strictEqual(heap.extract(), undefined, 'Heap ends up empty');

//
// A heap with a "novel" comparison function (ie. uses insertion order as a
// tie-breaker, which is something you would typically want in an actual
// priority queue).
//

const queue = new Heap<{rank: number; value: number}>(
	(a: {rank: number; value: number}, b: {rank: number; value: number}) => {
		if (a.value !== b.value) {
			return b.value - a.value;
		} else {
			// Tie-break on rank.
			return b.rank - a.rank;
		}
	}
);

let timestamp = 0;

queue.insert({value: 50, rank: timestamp++});
queue.insert({value: 10, rank: timestamp++});
queue.insert({value: 75, rank: timestamp++});
queue.insert({value: 50, rank: timestamp++});
queue.insert({value: 75, rank: timestamp++});

assert.deepEqual(
	queue.extract(),
	{value: 10, rank: 1},
	'Extracts the smallest item (10)'
);
assert.deepEqual(
	queue.extract(),
	{value: 50, rank: 0},
	'Tiebreaks using rank (50, rank 0)'
);
assert.deepEqual(
	queue.extract(),
	{value: 50, rank: 3},
	'Extracts the smallest item (50)'
);
assert.deepEqual(
	queue.extract(),
	{value: 75, rank: 2},
	'Tiebreaks using rank (75, rank 2)'
);
assert.deepEqual(
	queue.extract(),
	{value: 75, rank: 4},
	'Extracts the smallest item (75)'
);

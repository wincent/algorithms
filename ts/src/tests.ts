import assert from 'assert';

import Board from './Board';
import Heap from './Heap';

// This is example from:
//
//      https://coursera.cs.princeton.edu/algs4/assignments/8puzzle/specification.php
//
let board = new Board([
	[8, 1, 3],
	[4, 0, 2],
	[7, 6, 5],
]);

const goal = new Board([
	[1, 2, 3],
	[4, 5, 6],
	[7, 8, 0],
]);

//
// Test Board#equals().
//

assert(board.equals(board));
assert(
	board.equals(
		new Board([
			[8, 1, 3],
			[4, 0, 2],
			[7, 6, 5],
		])
	)
);
assert.equal(board.equals(goal), false);
assert.equal(board.equals(1000), false);

//
// Test Board#hamming().
//

assert.equal(goal.hamming(), 0);

assert.equal(board.hamming(), 5);

//
// Test Board#isGoal().
//

assert.equal(goal.isGoal(), true);
assert.equal(board.isGoal(), false);

//
// Test Board#manhattan().
//

assert.equal(goal.manhattan(), 0);
assert.equal(board.manhattan(), 10);

//
// Test Board#neighbors().
//

const neighbors = [
	...new Board([
		[1, 0, 3],
		[4, 2, 5],
		[7, 8, 6],
	]).neighbors(),
];

assert.equal(neighbors.length, 3);

assert.equal(
	neighbors[0].equals(
		new Board([
			[1, 3, 0],
			[4, 2, 5],
			[7, 8, 6],
		])
	),
	true
);

assert.equal(
	neighbors[1].equals(
		new Board([
			[0, 1, 3],
			[4, 2, 5],
			[7, 8, 6],
		])
	),
	true
);

assert.equal(
	neighbors[2].equals(
		new Board([
			[1, 2, 3],
			[4, 0, 5],
			[7, 8, 6],
		])
	),
	true
);

//
// Test Board#toString().
//

assert.equal(goal.toString(), '3\n' + ' 1 2 3\n' + ' 4 5 6\n' + ' 7 8 0');

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

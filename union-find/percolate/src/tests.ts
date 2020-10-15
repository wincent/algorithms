import assert from 'assert';

import Percolation from './Percolation';
import UnionFind from './UnionFind';
import permute from './permute';

const uf = new UnionFind(10);

// Each item is its own leader initially.

assert.equal(uf.find(0), 0);
assert.equal(uf.find(1), 1);
assert.equal(uf.find(2), 2);

// union(), er, unions.

uf.union(4, 7);
assert.equal(uf.find(4), 7);
assert.equal(uf.find(7), 7);

// ... but leaves other items unchanged.

assert.equal(uf.find(0), 0);
assert.equal(uf.find(6), 6);

// Show that percolation testing works regardless of order.

assert.deepEqual(permute([0, 1, 2]), [
	[0, 1, 2],
	[1, 0, 2],
	[2, 0, 1],
	[0, 2, 1],
	[1, 2, 0],
	[2, 1, 0],
]);

permute([0, 1, 2, 3, 4, 5, 6, 7]).forEach((rows) => {
	const p = new Percolation(8);

	for (let i = 0; i < 7; i++) {
		p.open(rows[i], 0);
	}

	assert.equal(p.percolates(), false);

	p.open(rows[7], 0);

	assert.equal(p.percolates(), true);
});

// The diagram from the README.

const p = new Percolation(6);

// Open up area "A".

p.open(0, 0);
p.open(0, 1);
p.open(0, 2);
p.open(1, 0);
p.open(1, 1);
p.open(2, 0);

// Open up area "C".

p.open(4, 0);
p.open(4, 1);
p.open(5, 0);
p.open(5, 1);
p.open(5, 2);

assert.equal(p.percolates(), false);

p.open(3, 0);

assert.equal(p.percolates(), true);

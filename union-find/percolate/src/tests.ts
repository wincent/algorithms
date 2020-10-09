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

// TODO: write some real percolation tests...

const p = new Percolation(8);

assert.equal(p.percolates(), true);

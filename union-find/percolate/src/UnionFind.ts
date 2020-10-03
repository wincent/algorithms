export default class UnionFind {
	_parents: Array<number>;
	_rank: Array<number>;
	size: number;

	constructor(size: number) {
		this._parents = [...Array(size).keys()];
		this._rank = new Array(size).fill(0);
		this.size = size;
	}

	union(a: number, b: number) {
		a = this.find(a);
		b = this.find(b);

		if (a === b) {
			return;
		} else if (this._rank[a] < this._rank[b]) {
			this._parents[a] = b;
		} else if (this._rank[b] > this._rank[a]) {
			this._parents[b] = a;
		} else {
			this._parents[a] = b;
			this._rank[b]++;
		}
	}

	find(index: number) {
		let parent = this._parents[index];

		if (parent === index) {
			return index;
		}

		// Walk up to the leader.
		while (this._parents[parent] !== parent) {
			parent = this._parents[parent];
		}

		// Compress path.
		let current = index;
		while (current !== parent) {
			const next = this._parents[current];
			this._parents[current] = parent;
			current = next;
		}

		return parent;
	}
}

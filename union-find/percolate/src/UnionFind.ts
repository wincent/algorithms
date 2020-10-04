let parents: Array<number>;
let rank: Array<number>;

export default class UnionFind {
	constructor(size: number) {
		if (!parents) {
			parents = new Array(size);
		}

		if (!rank) {
			rank = new Array(size);
		}

		for (let i = 0; i < size; i++) {
			parents[i] = i;
			rank[i] = 0;
		}
	}

	union(a: number, b: number) {
		a = this.find(a);
		b = this.find(b);

		if (a === b) {
			return;
		}

		if (rank[a] < rank[b]) {
			parents[a] = b;
		} else if (rank[b] > rank[a]) {
			parents[b] = a;
		} else {
			parents[a] = b;
			rank[b]++;
		}
	}

	find(index: number) {
		let parent = parents[index];

		if (parent === index) {
			return index;
		}

		// Walk up to the leader.
		while (parents[parent] !== parent) {
			parent = parents[parent];
		}

		// Compress path.
		let current = index;
		while (current !== parent) {
			const next = parents[current];
			parents[current] = parent;
			current = next;
		}

		return parent;
	}
}

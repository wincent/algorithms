export default class UnionFind {
	#parents: Array<number>;
	#rank: Array<number>;
	size: number;

	constructor(size: number) {
		this.#parents = [...Array(size).keys()];
		this.#rank = new Array(size).fill(0);
		this.size = size;
	}

	union(a: number, b: number) {
		a = this.find(a);
		b = this.find(b);

		if (a === b) {
			return;
		} else if (this.#rank[a] < this.#rank[b]) {
			this.#parents[a] = b;
		} else if (this.#rank[b] > this.#rank[a]) {
			this.#parents[b] = a;
		} else {
			this.#parents[a] = b;
			this.#rank[b]++;
		}
	}

	find(index: number) {
		let parent = this.#parents[index];

		if (parent === index) {
			return index;
		}

		// Walk up to the leader.
		while (this.#parents[parent] !== parent) {
			parent = this.#parents[parent];
		}

		// Compress path.
		let current = index;
		while (current !== parent) {
			const next = this.#parents[current];
			this.#parents[current] = parent;
			current = next;
		}

		return parent;
	}
}

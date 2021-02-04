export default class Heap<T> {
	_comparator: (a: T, b: T) => number;
	_count: number;
	_storage: Array<T>;

	constructor(comparator: (a: T, b: T) => number) {
		this._comparator = comparator;

		this._count = 0;

		this._storage = [];
	}

	extract(): T | undefined {
		let extracted = undefined;

		if (this._count) {
			// Grab root value.
			extracted = this._storage[0];

			// Move last item to root.
			this._storage[0] = this._storage[this._count - 1];
			this._storage.length = --this._count;

			// Restore heap property.
			this._heapify(0);
		}

		return extracted;
	}

	insert(value: T) {
		// Insert into first empty slot.
		let current = this._count;
		this._storage[this._count++] = value;

		// Bubble upwards until heap property is restored.
		let parent = parentIndex(current);

		while (current && !this._satisfiesHeapProperty(parent, current)) {
			this._swap(current, parent);
			current = parent;
			parent = parentIndex(current);
		}
	}

	/**
	 * Compares values at indices `a` and `b` using the heap's `comparator`.
	 */
	_compare(a: number, b: number) {
		return this._comparator(this._storage[a], this._storage[b]);
	}

	/**
	 * Restores the heap property starting at `index`.
	 */
	_heapify(index: number) {
		const left = leftIndex(index);

		const right = rightIndex(index);

		const smallest =
			right < this._count
				? // Right (and therefore left) child exists.
				  this._compare(left, right) > 0
					? left
					: right
				: left < this._count
				? // Only left child exists.
				  left
				: // No children exist.
				  index;

		if (
			smallest !== index &&
			!this._satisfiesHeapProperty(index, smallest)
		) {
			// Swap with smallest child.
			this._swap(index, smallest);
			this._heapify(smallest);
		}
	}

	/**
	 * Returns `true` if the heap property holds (ie. parent < child, according
	 * to the heap's `comparator`).
	 */
	_satisfiesHeapProperty(parent: number, child: number) {
		return this._compare(parent, child) > 0;
	}

	/**
	 * Swap the values at indexes `a` and `b`.
	 */
	_swap(a: number, b: number) {
		const value = this._storage[a];
		this._storage[a] = this._storage[b];
		this._storage[b] = value;
	}

	get size() {
		return this._count;
	}
}

function parentIndex(index: number) {
	return Math.floor((index - 1) / 2);
}

function leftIndex(index: number) {
	return 2 * index + 1;
}

function rightIndex(index: number) {
	return 2 * index + 2;
}

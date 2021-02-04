const DEFAULT_BUFFER_SIZE = 1024;
const BUFFER_GROWTH_FACTOR = 1.5;

/**
 * A Uint8Array wrapper that resizes the underlying storage when it becomes
 * full. The name `DynamicArray` is overpromising a bit, because the only
 * supported operation is `push()`.
 */
export default class DynamicArray {
	#capacity: number;
	#storage: Uint8Array;
	#used: number;

	constructor(capacity = DEFAULT_BUFFER_SIZE) {
		this.#capacity = capacity;
		this.#storage = new Uint8Array(capacity);
		this.#used = 0;
	}

	push(value: number) {
		if (this.#used === this.#capacity) {
			this.#capacity *= BUFFER_GROWTH_FACTOR;
			const previous = this.#storage;
			this.#storage = new Uint8Array(this.#capacity);
			this.#storage.set(previous);
		}

		this.#storage[this.#used++] = value;
	}

	snapshot(): Uint8Array {
		return this.#storage.subarray(0, this.#used);
	}

	get length() {
		return this.#used;
	}

	get storage() {
		return this.#storage;
	}
}

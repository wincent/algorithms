import Heap from './Heap';

export default class MinPQ<T> {
	_queue: Heap<T>;

	constructor(comparator: (a: T, b: T) => number) {
		this._queue = new Heap<T>(comparator);
	}

	extract(): T | undefined {
		return this._queue.extract();
	}

	insert(item: T) {
		this._queue.insert(item);
	}

	get size() {
		return this._queue.size;
	}
}

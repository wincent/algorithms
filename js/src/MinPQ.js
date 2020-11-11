const Heap = require('./Heap');

module.exports = class MinPQ {
	constructor(comparator) {
		this._queue = new Heap(comparator);
	}

	extract() {
		return this._queue.extract();
	}

	insert(item) {
		this._queue.insert(item);
	}
};

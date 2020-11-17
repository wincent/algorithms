module.exports = class Queue {
	constructor() {
		this._head = null;
		this._tail = null;
	}

	dequeue() {
		if (this._head) {
			const head = this._head;

			this._head = head.next;

			if (!this._head) {
				this._tail = null;
			}

			return head.value;
		}

		return null;
	}

	enqueue(value) {
		const node = {value, next: null};

		if (this._tail) {
			this._tail.next = node;
		} else {
			this._head = node;
		}

		this._tail = node;
	}

	isEmpty() {
		return !this._head;
	}

	*[Symbol.iterator]() {
		while (!this.isEmpty()) {
			yield this.dequeue();
		}
	}
};

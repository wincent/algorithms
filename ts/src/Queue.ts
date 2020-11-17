type Node<T> = {
	next: Node<T> | null;
	value: T;
};

export default class Queue<T extends {}> {
	_head: Node<T> | null;
	_tail: Node<T> | null;

	constructor() {
		this._head = null;
		this._tail = null;
	}

	dequeue(): T | null {
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

	enqueue(value: T) {
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

	*[Symbol.iterator](): Iterator<T> {
		while (!this.isEmpty()) {
			yield this.dequeue()!;
		}
	}
}

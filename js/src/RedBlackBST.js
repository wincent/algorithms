const assert = require('assert');

const Queue = require('./Queue');

const RED = true;
const BLACK = false;

/**
 * Left-leaning Red-Black BST with keys of type `Tk` and values of type `Tv`.
 */
module.exports = class RedBlackBST {
	constructor() {
		this._root = null;
	}

	get(key) {
		let x = this._root;

		while (x !== null) {
			const comparison = key.compareTo(x.key);

			if (comparison < 0) {
				x = x.left;
			}

			if (comparison > 0) {
				x = x.right;
			}

			if (comparison === 0) {
				return x.value;
			}
		}

		return null;
	}

	isEmpty() {
		return this._root === null;
	}

	keys() {
		const queue = new Queue();

		if (this.isEmpty()) {
			return queue;
		}

		this._keys(this._root, queue, this.min(), this.max());

		return queue;
	}

	/**
	 * Returns the largest key in the tree.
	 */
	max() {
		return this.isEmpty() ? null : this._max(this._root).key;
	}

	/**
	 * Returns the smallest key in the tree.
	 */
	min() {
		return this.isEmpty() ? null : this._min(this._root).key;
	}

	put(key, value) {
		this._root = this._put(this._root, key, value);
		this._root.color = BLACK;
	}

	get size() {
		return this._size(this._root);
	}

	_flipColors(h) {
		assert(!this._isRed(h));
		assert(this._isRed(h.left));
		assert(this._isRed(h.right));
		h.color = RED;
		h.left.color = BLACK;
		h.right.color = BLACK;
	}

	_isRed(x) {
		return !!(x && x.color === RED);
	}

	_keys(x, queue, lo, hi) {
		if (x === null) {
			return;
		}
		const lowComparison = lo.compareTo(x.key);
		const highComparison = hi.compareTo(x.key);
		if (lowComparison < 0) {
			this._keys(x.left, queue, lo, hi);
		}
		if (lowComparison <= 0 && highComparison >= 0) {
			queue.enqueue(x.key);
		}
		if (highComparison > 0) {
			this._keys(x.right, queue, lo, hi);
		}
	}

	_max(x) {
		return x.right === null ? x : this._max(x.right);
	}

	_min(x) {
		return x.left === null ? x : this._min(x.left);
	}

	_put(h, key, value) {
		if (!h) {
			return {
				color: RED,
				key,
				left: null,
				right: null,
				size: 1,
				value,
			};
		}

		// Standard BST insertion.

		const comparison = key.compareTo(h.key);

		if (comparison < 0) {
			h.left = this._put(h.left, key, value);
		} else if (comparison > 0) {
			h.right = this._put(h.right, key, value);
		} else {
			h.value = value;
		}

		// Red-Black rebalancing.

		if (this._isRed(h.right) && !this._isRed(h.left)) {
			h = this._rotateLeft(h); // Lean left.
		}

		if (this._isRed(h.left) && this._isRed(h.left.left)) {
			h = this._rotateRight(h); // Balance temporary 4-node.
		}

		if (this._isRed(h.left) && this._isRed(h.right)) {
			this._flipColors(h); // Split temporary 4-node.
		}

		h.size = this._size(h.left) + this._size(h.right) + 1;

		return h;
	}

	_rotateLeft(h) {
		assert(this._isRed(h.right));
		const x = h.right;
		h.right = x.left;
		x.left = h;
		x.color = h.color;
		h.color = RED;
		x.size = h.size;
		h.size = this._size(h.left) + this._size(h.right) + 1;
		return x;
	}

	_rotateRight(h) {
		assert(this._isRed(h.left));
		const x = h.left;
		h.left = x.right;
		x.right = h;
		x.color = h.color;
		h.color = RED;
		x.size = h.size;
		h.size = this._size(h.left) + this._size(h.right) + 1;
		return x;
	}

	_size(x) {
		return x === null ? 0 : x.size;
	}
};

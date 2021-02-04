import BinaryStdIn from './BinaryStdIn';
import BinaryStdOut from './BinaryStdOut';
import MinPQ from './MinPQ';

import type {BinaryReadable, Writable} from './types';

const RADIX = 256;

export default class Huffman {
	#stdin: BinaryReadable;
	#stdout: BinaryStdOut;

	constructor(
		stdin: BinaryReadable = new BinaryStdIn(),
		stdout: Writable = process.stdout
	) {
		this.#stdin = stdin;
		this.#stdout = new BinaryStdOut(stdout);
	}

	compress() {
		const input = this.#stdin.readString();

		const frequencies = new Array(RADIX).fill(0);

		for (let i = 0; i < input.length; i++) {
			frequencies[input[i]]++;
		}

		const root = buildTrie(frequencies);

		const codeTable = new Array(RADIX);

		buildCode(codeTable, root, '');

		// Write out preliminaries.

		this._writeTrie(root);

		this.#stdout.writeInt(input.length);

		// Write out encoded contents.
		for (let i = 0; i < input.length; i++) {
			const code = codeTable[input[i]];

			for (let j = 0; j < code.length; j++) {
				this.#stdout.writeBoolean(code[j] === '1');
			}
		}

		this.#stdout.close();
	}

	expand() {
		const root = this._readTrie();

		const length = this.#stdin.readInt();

		for (let i = 0; i < length; i++) {
			let node = root;

			while (!node.isLeaf()) {
				const bit = this.#stdin.readBoolean();
				if (bit) {
					node = node.right!;
				} else {
					node = node.left!;
				}
			}

			this.#stdout.writeByte(node.value ?? 0);
		}
	}

	_readTrie(): Node {
		const isLeaf = this.#stdin.readBoolean();

		if (isLeaf) {
			return new Node(this.#stdin.readChar(), -1, null, null);
		} else {
			return new Node(null, -1, this._readTrie(), this._readTrie());
		}
	}

	_writeTrie(x: Node) {
		if (x.isLeaf()) {
			this.#stdout.writeBoolean(true);
			this.#stdout.writeByte(x.value!);
		} else {
			this.#stdout.writeBoolean(false);
			this._writeTrie(x.left!);
			this._writeTrie(x.right!);
		}
	}
}

function buildCode(codeTable: Array<string>, x: Node, code: string) {
	if (x.isLeaf()) {
		codeTable[x.value!] = code;
	} else {
		buildCode(codeTable, x.left!, code + '0');
		buildCode(codeTable, x.right!, code + '1');
	}
}

function buildTrie(frequencies: Array<number>): Node {
	const pq = new MinPQ<Node>((a: Node, b: Node): number => b.compareTo(a));

	// Create one node for each existing character.
	for (let i = 0; i < RADIX; i++) {
		if (frequencies[i] > 0) {
			pq.insert(new Node(i, frequencies[i], null, null));
		}
	}

	// Repeatedly merge two smallest trees.
	while (pq.size > 1) {
		const left = pq.extract() || null;
		const right = pq.extract() || null;

		const parent = new Node(
			null,
			(left?.frequency ?? 0) + (right?.frequency ?? 0),
			left,
			right
		);

		pq.insert(parent);
	}

	return pq.extract()!;
}

class Node {
	#frequency: number;
	#left: Node | null;
	#right: Node | null;
	#value: number | null;

	constructor(
		value: number | null,
		frequency: number,
		left: Node | null,
		right: Node | null
	) {
		if (
			(left === null && right === null) ||
			(left !== null && right !== null)
		) {
			this.#value = value;
			this.#frequency = frequency;
			this.#left = left;
			this.#right = right;
		} else {
			throw new Error(
				'Both left and right must be null, or neither must be null'
			);
		}
	}

	compareTo(other: Node) {
		return this.#frequency - other.frequency;
	}

	isLeaf() {
		return !this.#left && !this.#right;
	}

	get frequency() {
		return this.#frequency;
	}

	get left() {
		return this.#left;
	}

	get right() {
		return this.#right;
	}

	get value() {
		return this.#value;
	}
}

function main() {
	if (process.argv.length !== 3) {
		throw new Error(
			'Expected exactly one argument ("-" to compress, or "+" to expand)'
		);
	}

	const mode = process.argv[2];

	if (mode === '-') {
		new Huffman().compress();
	} else if (mode === '+') {
		new Huffman().expand();
	} else {
		throw new Error(
			`Expected "-" to compress or "+" to expand, got ${JSON.stringify(
				mode
			)}`
		);
	}
}

if (require.main === module) {
	main();
}

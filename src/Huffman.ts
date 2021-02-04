import BinaryStdIn from './BinaryStdIn';
import MinPQ from './MinPQ';
import RingBuffer from './RingBuffer';

import type {BinaryReadable, Writable} from './types';

const RADIX = 256;

export default class Huffman {
	#stdin: BinaryReadable;
	#stdout: BufferedWriter;

	constructor(
		stdin: BinaryReadable = new BinaryStdIn(),
		stdout: Writable = process.stdout
	) {
		this.#stdin = stdin;
		this.#stdout = new BufferedWriter(stdout);
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

/**
 * The Huffman coder is the only place where we need to do lots of partial
 * writes of sub-byte sizes, so we make a little buffering wrapper class here.
 */
// TODO: probably move this into separate file to declutter
class BufferedWriter implements Writable {
	#buffer: RingBuffer;
	#byte: Uint8Array;
	#closed: boolean;
	#writable: Writable;

	constructor(writable: Writable) {
		// Abuse RingBuffer because it handles bitwise manipulation for us.
		this.#buffer = new RingBuffer(16);
		this.#byte = new Uint8Array(1);
		this.#closed = false;
		this.#writable = writable;
	}

	close() {
		if (this.#closed) {
			throw new Error('Cannot close already-closed BufferedWriter');
		}

		while (this.#buffer.size) {
			const size = this.#buffer.size;

			const byte = this.#buffer.shift(Math.min(8, size));

			if (size === 8) {
				this._write(byte);
			} else {
				// Make sure bits are as far left as possible.
				this._write(byte << (8 - size));
			}
		}

		this.#closed = true;
	}

	write(str: Uint8Array | string): boolean {
		if (this.#closed) {
			return false;
		} else if (this.#buffer.size) {
			let wrote = false;

			if (typeof str === 'string') {
				for (let i = 0; i < str.length; i++) {
					wrote = this.writeByte(str[i].charCodeAt(0));
				}
			} else {
				for (let i = 0; i < str.length; i++) {
					wrote = this.writeByte(str[i]);
				}
			}

			return wrote;
		} else {
			return this.#writable.write(str);
		}
	}

	writeBoolean(bit: boolean): boolean {
		if (this.#closed) {
			return false;
		} else {
			if (this.#buffer.size >= 8) {
				this._write(this.#buffer.shift(8));
			}

			this.#buffer.push(bit ? 1 : 0, 1);

			return true;
		}
	}

	writeByte(byte: number): boolean {
		if (!this.#buffer.size) {
			return this._write(byte);
		}

		while (this.#buffer.size >= 8) {
			this._write(this.#buffer.shift(8));
		}

		this.#buffer.push(byte, 8);

		return this._write(this.#buffer.shift(8));
	}

	writeInt(value: number): boolean {
		return (
			this.writeByte((value & 0xff000000) >>> 24),
			this.writeByte((value & 0x00ff0000) >>> 16),
			this.writeByte((value & 0x0000ff00) >>> 8),
			this.writeByte((value & 0x000000ff) >>> 0)
		);
	}

	_write(byte: number): boolean {
		if (this.#closed) {
			return false;
		}

		this.#byte[0] = byte;

		return this.#writable.write(this.#byte);
	}
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

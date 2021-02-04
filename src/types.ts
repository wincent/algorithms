export interface BinaryReadable {
	close: () => void;
	isEmpty: () => boolean;
	readBoolean: () => boolean;
	readChar: (bits?: number) => number;
	readInt: () => number;
	readString: () => Uint8Array;
}

export interface Writable {
	write: (str: Uint8Array | string) => boolean;
}

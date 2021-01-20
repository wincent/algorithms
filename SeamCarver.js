(function () {
	const MAX_ENERGY = 1000;

	class SeamCarver {
		#dirty;
		#energies;
		#height;
		#imageData;
		#transposed;
		#width;

		constructor(imageData) {
			this.#imageData = imageData;
			this.#height = imageData.height;
			this.#width = imageData.width;
			this.#energies = new Array(this.#height * this.#width);
			this.#dirty = true;
		}

		/**
		 * "The `energy()` method should take constant time in the worst case."
		 */
		energy(x, y) {
			const index = this.#width * y + x;

			if (this.#energies[index] === undefined) {
				if (
					x === 0 ||
					x === this.#width - 1 ||
					y === 0 ||
					y === this.#height - 1
				) {
					// We're on the border.
					this.#energies[index] = MAX_ENERGY;
				} else {
					// We're in the middle.
					const left = this._rgb(x - 1, y);
					const right = this._rgb(x + 1, y);
					const above = this._rgb(x, y - 1);
					const below = this._rgb(x, y + 1);

					const rx = right[0] - left[0];
					const ry = below[0] - above[0];
					const gx = right[1] - left[1];
					const gy = below[1] - above[1];
					const bx = right[2] - left[2];
					const by = below[2] - above[2];

					const xGradient = rx ** 2 + gx ** 2 + bx ** 2;
					const yGradient = ry ** 2 + gy ** 2 + by ** 2;

					this.#energies[index] = Math.sqrt(xGradient + yGradient);
				}
			}

			return this.#energies[index];
		}

		/**
		 * Returns a grayscale representation of the energy levels of the
		 * current image.
		 */
		energyPicture() {
			const imageData = new ImageData(this.#width, this.#height);

			const colorPerEnergy = 255 / MAX_ENERGY;

			const energies = this.energies;

			for (let i = 0; i < energies.length; i++) {
				const energy = energies[i];
				const color = colorPerEnergy * energy;

				let pixel = i * 4;

				imageData.data[pixel++] = color;
				imageData.data[pixel++] = color;
				imageData.data[pixel++] = color;
				imageData.data[pixel] = 255;
			}

			return imageData;
		}

		/**
		 * Analogous to `findVerticalSeam()` except returns an array of
		 * length `width` such that entry `x` is the row number of the
		 * pixel to be removed from column `x` of the image.
		 */
		findHorizontalSeam() {
			// As recommended in the problem spec, we reduce code duplication
			// here by transposing the image and finding a vertical seam in
			// that.
			//
			// It would certainly be faster to just duplicate the
			// code from `findVerticalSeam()` here and tweak the
			// variables/properties to work in that orientation, but
			// that wouldn't be fun, and the alternative of extracting
			// out a common helper method to handle both orientations
			// for us would bring a lot of complexity.
			return this.getTransposed().findVerticalSeam();
		}

		/**
		 * Returns an array of length `H` such that entry `y` is the column
		 * number of the pixel to be removed from row `y` of the image.
		 *
		 * Seams are found by doing a topological traversal of the image
		 * DAG described below, so as to find the shortest path from any
		 * top-row node to any bottom-row node.
		 *
		 * In this 3-by-3 image, the lines ("\", "|", and "/") represent
		 * directed edges from pixels ("P"), where the edge weight corresponds
		 * to the target pixel's "energy". "S" and "E" represent virtual
		 * starting and ending nodes connected to the graph via edges of equal
		 * weight; these don't correspond to actual pixels, but provide us with
		 * a place to start and stop our shortest path search.
		 *
		 *             S
		 *            /|\
		 *           / | \
		 *          P  P  P
		 *          |\/|\/|
		 *          |/\|\/|
		 *          P  P  P
		 *          |\/|\/|
		 *          |/\|\/|
		 *          P  P  P
		 *           \ | /
		 *            \|/
		 *             E
		 *
		 * Note that because the graph is so regular, we don't need to
		 * do an actual DFS in order to visit vertices in a valid topological
		 * ordering (we can just use a couple of nested loops). Likewise, we
		 * don't need to explicitly model the graph or the edges with separate
		 * objects; we can just index into the energies array.
		 */
		findVerticalSeam() {
			const vertexCount = this.#width * this.#height + 2;
			const startNode = vertexCount - 2;
			const endNode = vertexCount - 1;

			const distTo = new Array(vertexCount);
			const edgeTo = new Array(vertexCount);

			for (let i = 0; i < vertexCount; i++) {
				distTo[i] = Infinity;
			}

			distTo[startNode] = 0;

			const energies = this.energies;

			function relax(v, w) {
				const weight = energies[w] ?? 0;

				if (distTo[w] > distTo[v] + weight) {
					distTo[w] = distTo[v] + weight;

					edgeTo[w] = v;
				}
			}

			// We're at the virtual starting node.
			// Relax all the edges leading to the first row.
			for (let x = 0; x < this.#width; x++) {
				relax(startNode, x);
			}

			// Look at each row of pixel data, except the last (which will be
			// handled later as a special case).
			for (let y = 0; y < this.#height - 1; y++) {
				for (let x = 0; x < this.#width; x++) {
					const v = y * this.#width + x;

					if (x > 0) {
						// Relax edge to left child.
						const w = v + this.#width - 1;
						relax(v, w);
					}

					// Relax edge to middle child.
					const w = v + this.#width;
					relax(v, w);

					if (x < this.#width - 1) {
						// Relax edge to right child.
						const w = v + this.#width + 1;
						relax(v, w);
					}
				}
			}

			// Now do the last row of image data.
			// Relax all edges leading to the virtual ending node.
			for (let x = 0; x < this.#width; x++) {
				const v = (this.#height - 1) * this.#width + x;

				relax(v, endNode);
			}

			// Walk backwards along shortest path, producing an array of
			// columns to be removed at each row of pixel data.
			const path = new Array(this.#height);

			let node = endNode;

			for (let i = path.length - 1; i >= 0; i--) {
				node = edgeTo[node];

				path[i] = node % this.#width;
			}

			return path;
		}

		/**
		 * Returns current ImageData.
		 */
		picture() {
			return this.#imageData;
		}

		removeHorizontalSeam(seam) {
			// Again using transposition as shortcut here. This is inefficient
			// (for example, we invalidate the entire `energies` cache to keep
			// things simple); a "real" implementation would probably just
			// replicate the code in `removeVerticalSeam`, with modifications.
			const transposed = this.getTransposed();

			transposed.removeVerticalSeam(seam);

			this.#imageData = transpose(transposed.picture());
			this.#height = this.#height - 1;
			this.#energies = new Array(this.#height * this.#width);
			this.#dirty = true;
			this.#transposed = undefined;
		}

		removeVerticalSeam(seam) {
			const data = new Uint8ClampedArray(
				(this.#width - 1) * this.#height * 4
			);

			const oldEnergies = this.energies;
			const newEnergies = [];

			for (let y = 0; y < this.#height; y++) {
				const offset = y * this.#width * 4;
				const end = offset + seam[y] * 4;

				if (seam[y]) {
					const prefix = this.#imageData.data.slice(offset, end);

					data.set(prefix, y * (this.#width - 1) * 4);
				}

				if (seam[y] < this.#width - 1) {
					const suffix = this.#imageData.data.slice(
						end + 4,
						(y + 1) * this.#width * 4
					);

					data.set(suffix, y * (this.#width - 1) * 4 + end - offset);
				}

				for (let x = 0; x < this.#width; x++) {
					const pixel = y * this.#width + x;

					if (seam[y] === x) {
						// Invalidate neigbors in the energies array,
						// forcing them to be recomputed on next access.
						if (x > 0) {
							// Invalidate left.
							newEnergies[newEnergies.length - 2] = undefined;
						}

						if (x < this.#width - 1) {
							// Invalidate right.
							oldEnergies[pixel + 1] = undefined;
						}

						if (y > 0) {
							// Invalidate above.
							newEnergies[
								newEnergies.length - this.#width
							] = undefined;
						}

						if (y < this.#height - 1) {
							// Invalidate below.
							oldEnergies[pixel + this.#width] = undefined;
						}
					} else {
						newEnergies.push(oldEnergies[pixel]);
					}
				}
			}

			this.#dirty = true;
			this.#energies = newEnergies;
			this.#imageData = new ImageData(data, this.#width - 1);
			this.#width = this.#width - 1;
			this.#transposed = undefined;
		}

		_rgb(x, y) {
			const {data} = this.#imageData;
			const pixel = (y * this.#width + x) * 4;

			return [data[pixel], data[pixel + 1], data[pixel + 2]];
		}

		getTransposed() {
			if (!this.#transposed) {
				this.#transposed = new SeamCarver(transpose(this.#imageData));
			}

			return this.#transposed;
		}

		get energies() {
			if (this.#dirty) {
				for (let y = 0; y < this.#height; y++) {
					for (let x = 0; x < this.#width; x++) {
						if (this.#energies[y * this.#width + x] === undefined) {
							this.energy(x, y);
						}
					}
				}

				this.#dirty = false;
			}

			return this.#energies;
		}

		get height() {
			return this.#height;
		}

		get width() {
			return this.#width;
		}
	}

	/**
	 * Takes `imageData` (an ImageData object) and returns a transposed copy.
	 */
	function transpose(imageData) {
		const {height, width} = imageData;
		const source = imageData.data;
		const destination = new Uint8ClampedArray(source.length);

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let i = 0; i < 4; i++) {
					destination[(x * height + y) * 4 + i] =
						source[(y * width + x) * 4 + i];
				}
			}
		}

		return new ImageData(destination, height);
	}

	window.SeamCarver = SeamCarver;
})();

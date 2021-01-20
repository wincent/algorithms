(function () {
	const MAX_ENERGY = 1000;

	class SeamCarver {
		#height;
		#imageData;
		#width;

		constructor(imageData) {
			this.#imageData = imageData;
			this.#height = imageData.height;
			this.#width = imageData.width;
		}

		energy(x, y) {
			return MAX_ENERGY;
		}

		/**
		 * Returns a grayscale representation of the energy levels of the
		 * current image.
		 */
		energyPicture() {
			return this.#imageData;
		}

		/**
		 * Analogous to `findVerticalSeam()` except returns an array of
		 * length `width` such that entry `x` is the row number of the
		 * pixel to be removed from column `x` of the image.
		 */
		findHorizontalSeam() {
			return [];
		}

		/**
		 * Returns an array of length `H` such that entry `y` is the column
		 * number of the pixel to be removed from row `y` of the image.
		 *
		 * Seams are found by doing a topological traversal of the image
		 * DAG described below, so as to find the shortest path from any
		 * top-row node to any bottom-row node.
		 */
		findVerticalSeam() {
			return [];
		}

		/**
		 * Returns current ImageData.
		 */
		picture() {
			return this.#imageData;
		}

		removeHorizontalSeam(seam) {}

		removeVerticalSeam(seam) {}

		get height() {
			return this.#height;
		}

		get width() {
			return this.#width;
		}
	}

	window.SeamCarver = SeamCarver;
})();

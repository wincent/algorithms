(function () {
	const canvas = document.getElementById('image-canvas');
	const context = canvas.getContext('2d');
	const dropText = document.getElementById('drop-text');
	const energyButton = document.getElementById('show-energy');
	const removeSeamButton = document.getElementById('remove-seam');
	const showSeamButton = document.getElementById('show-seam');
	const zoomInButton = document.getElementById('zoom-in');
	const zoomOutButton = document.getElementById('zoom-out');
	const zoomResetButton = document.getElementById('zoom-reset');
	const imageWrapper = document.getElementById('image-wrapper');

	const INITIAL_HEIGHT = canvas.height;
	const INITIAL_WIDTH = canvas.width;
	const SCALES = [0.125, 0.25, 0.5, 1, 2, 4, 8];
	const SCALE_MIN = 0;
	const SCALE_MID = Math.floor(SCALES.length / 2);
	const SCALE_MAX = SCALES.length - 1;

	let bitmap;
	let height;
	let scale = SCALE_MID;
	let seamCarver;
	let shift = false;
	let width;

	document
		.getElementById('image-input')
		.addEventListener('change', (event) => {
			const files = event.srcElement.files;
			if (files.length) {
				createImageBitmap(files[0]).then(handleImageBitmap);
			} else {
				handleImageBitmap(undefined);
			}
		});

	document.addEventListener('keydown', (event) => {
		if (event.code.startsWith('Shift')) {
			shift = true;
		}
	});

	document.addEventListener('keyup', (event) => {
		if (event.code.startsWith('Shift')) {
			shift = false;
		}
	});

	configureDragAndDrop();

	zoomInButton.addEventListener('click', () => draw(scale + 1));
	zoomOutButton.addEventListener('click', () => draw(scale - 1));
	zoomResetButton.addEventListener('click', () => draw(SCALE_MID));

	energyButton.addEventListener('click', () => {
		createImageBitmap(seamCarver.energyPicture()).then((bitmap) => {
			context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		});
	});

	removeSeamButton.addEventListener('mousedown', () => {
		let removing = true;
		let timeout;

		function remove() {
			const horizontal = shift;

			if (
				!removing ||
				(horizontal && height === 1) ||
				(!horizontal && width === 1)
			) {
				return;
			}

			if (horizontal) {
				seamCarver.removeHorizontalSeam(
					seamCarver.findHorizontalSeam()
				);
			} else {
				seamCarver.removeVerticalSeam(seamCarver.findVerticalSeam());
			}

			createImageBitmap(seamCarver.picture()).then((bitmap) => {
				bitmap = bitmap;
				height = canvas.height = bitmap.height;
				width = canvas.width = bitmap.width;

				draw();

				timeout = requestAnimationFrame(remove);
			});
		}

		function cancel() {
			removing = false;
			cancelAnimationFrame(timeout);
		}

		removeSeamButton.addEventListener('mouseleave', cancel, {once: true});
		removeSeamButton.addEventListener('mouseup', cancel, {once: true});

		remove();
	});

	showSeamButton.addEventListener('click', (event) => {
		const horizontal = event.shiftKey;

		const seam = horizontal
			? seamCarver.findHorizontalSeam()
			: seamCarver.findVerticalSeam();

		context.fillStyle = 'rgba(255,0,0,1)';

		const multiplier = SCALES[scale];

		for (let i = 0; i < seam.length; i++) {
			context.fillRect(
				(horizontal ? i : seam[i]) * multiplier,
				(horizontal ? seam[i] : i) * multiplier,
				multiplier,
				multiplier
			);
		}
	});

	function configureDragAndDrop() {
		canvas.addEventListener('dragenter', (event) => {
			if (event.dataTransfer.types.includes('Files')) {
				imageWrapper.classList.add('dropzone');
				event.preventDefault();
			}
		});

		canvas.addEventListener('dragleave', () => {
			imageWrapper.classList.remove('dropzone');
		});

		canvas.addEventListener('dragover', (event) => {
			if (event.dataTransfer.types.includes('Files')) {
				event.preventDefault();
			}
		});

		canvas.addEventListener('drop', (event) => {
			if (event.dataTransfer.types.includes('Files')) {
				event.preventDefault();
				createImageBitmap(event.dataTransfer.files[0]).then(
					handleImageBitmap
				);
			}
			imageWrapper.classList.remove('dropzone');
		});
	}

	function handleImageBitmap(image) {
		bitmap = image;

		if (image) {
			height = bitmap.height;
			width = bitmap.width;

			energyButton.disabled = false;
			removeSeamButton.disabled = false;
			showSeamButton.disabled = false;

			dropText.style.display = 'none';
		} else {
			height = undefined;
			width = undefined;

			energyButton.disabled = true;
			removeSeamButton.disabled = true;
			showSeamButton.disabled = true;

			dropText.style.display = 'block';
		}

		draw();

		if (image) {
			seamCarver = new SeamCarver(
				context.getImageData(0, 0, width, height)
			);
		} else {
			seamCarver = undefined;
		}
	}

	function draw(newZoom = scale) {
		scale = Math.min(Math.max(newZoom, SCALE_MIN), SCALE_MAX);

		if (bitmap) {
			zoomInButton.disabled = scale === SCALE_MAX;
			zoomOutButton.disabled = scale === SCALE_MIN;
			zoomResetButton.disabled = scale === SCALE_MID;

			const x = SCALES[scale];
			const y = SCALES[scale];

			context.scale(x, y);

			canvas.height = height * y;
			canvas.width = width * x;

			context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		} else {
			zoomInButton.disabled = true;
			zoomOutButton.disabled = true;
			zoomResetButton.disabled = true;

			canvas.height = INITIAL_HEIGHT;
			canvas.width = INITIAL_WIDTH;

			context.clearRect(0, 0, canvas.width, canvas.height);
		}
	}
})();

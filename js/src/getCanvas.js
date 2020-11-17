const puppeteer = require('puppeteer');

module.exports = async function getCanvas(
	{height = 500, width = 500, xScale = 1, yScale = 1} = {
		height: 500,
		width: 500,
		xScale: 1,
		yScale: 1,
	}
) {
	const listeners = {
		click: [],
		drag: [],
		shiftclick: [],
	};

	function on(event, callback) {
		if (event === 'click') {
			listeners.click.push(callback);
		} else if (event === 'drag') {
			listeners.drag.push(callback);
		} else if (event === 'shiftclick') {
			listeners.shiftclick.push(callback);
		}
	}

	const browser = await puppeteer.launch({headless: false});

	const page = await browser.newPage();

	await page.exposeFunction('canvasclick', (x, y) => {
		for (const listener of listeners.click) {
			try {
				listener(x, y);
			} catch (error) {
				console.log(error);
			}
		}
	});

	await page.exposeFunction('canvasdrag', (x1, y1, x2, y2) => {
		for (const listener of listeners.drag) {
			try {
				listener(x1, y1, x2, y2);
			} catch (error) {
				console.log(error);
			}
		}
	});

	await page.exposeFunction('canvasshiftclick', (x, y) => {
		for (const listener of listeners.shiftclick) {
			try {
				listener(x, y);
			} catch (error) {
				console.log(error);
			}
		}
	});

	await page.exposeFunction(
		'getDimensions',
		(() => {
			return {
				height,
				width,
				xScale,
				yScale,
			};
		}).bind(null, height, width, xScale, yScale)
	);

	// inverseTransform(): transform from canvas coordinates to input
	// coordinates.

	await page.exposeFunction(
		'inverseTransform',
		((height, width, xScale, yScale, {x, y}) => {
			// Flip y coordinate (ie. move origin from top left).

			const flipped = {
				x,
				y: height - y,
			};

			// Scale canvas coordinates to fit within input coordinates.

			return {
				x: flipped.x / (width / xScale),
				y: flipped.y / (height / yScale),
			};
		}).bind(null, height, width, xScale, yScale)
	);

	// tranform(): transform from input coordinates to canvas coordinates.

	await page.exposeFunction(
		'transform',
		((height, width, xScale, yScale, {x, y}) => {
			// Flip y coordinate (ie. move origin to bottom left).

			const flipped = {
				x,
				y: yScale - y,
			};

			// Scale to fit within canvas.

			return {
				x: Math.floor(flipped.x / (xScale / width)),
				y: Math.floor(flipped.y / (yScale / height)),
			};
		}).bind(null, height, width, xScale, yScale)
	);

	const context = await page.evaluateHandle(async () => {
		const {height, width} = await window.getDimensions();

		const canvas = document.createElement('canvas');

		let dragStart = null;

		canvas.addEventListener('click', async (event) => {
			if (!dragStart) {
				const {x, y} = await window.inverseTransform({
					x: event.pageX - canvas.offsetLeft - canvas.clientLeft,
					y: event.pageY - canvas.offsetTop - canvas.clientTop,
				});

				if (event.shiftKey) {
					window.canvasshiftclick(x, y);
				} else {
					window.canvasclick(x, y);
				}
			}
		});

		canvas.addEventListener('mousedown', (event) => {
			dragStart = {
				x: event.pageX - canvas.offsetLeft - canvas.clientLeft,
				y: event.pageY - canvas.offsetTop - canvas.clientTop,
			};
		});

		canvas.addEventListener('mouseup', async (event) => {
			const dragEnd = {
				x: event.pageX - canvas.offsetLeft - canvas.clientLeft,
				y: event.pageY - canvas.offsetTop - canvas.clientTop,
			};

			if (
				dragStart &&
				(Math.abs(dragEnd.x - dragStart.x) > 15 ||
					Math.abs(dragEnd.y - dragStart.y) > 15)
			) {
				const {x: x1, y: y1} = await window.inverseTransform({
					x: dragStart.x,
					y: dragStart.y,
				});

				const {x: x2, y: y2} = await window.inverseTransform({
					x: dragEnd.x,
					y: dragEnd.y,
				});

				window.canvasdrag(x1, y1, x2, y2);
			}

			dragStart = null;
		});

		canvas.height = height;
		canvas.style.border = '1px solid rgba(0, 0, 0, 0.1)';
		canvas.width = width;

		document.body.appendChild(canvas);

		return canvas.getContext('2d');
	});

	const canvas = async (callback, ...args) => {
		await page.evaluate(callback, context, ...args);
	};

	canvas.on = on;

	return canvas;
};

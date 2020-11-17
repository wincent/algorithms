import puppeteer from 'puppeteer';

export default async function getCanvas(
	{
		height = 500,
		width = 500,
		xScale = 1,
		yScale = 1,
	}: {
		height: number;
		width: number;
		xScale: number;
		yScale: number;
	} = {
		height: 500,
		width: 500,
		xScale: 1,
		yScale: 1,
	}
) {
	const listeners: {
		click: Array<(x: number, y: number) => void>;
		drag: Array<(x1: number, y1: number, x2: number, y2: number) => void>;
		shiftclick: Array<(x: number, y: number) => void>;
	} = {
		click: [],
		drag: [],
		shiftclick: [],
	};

	function on(event: 'click', callback: (x: number, y: number) => void): void;

	function on(
		event: 'drag',
		callback: (x1: number, y1: number, x2: number, y2: number) => void
	): void;

	function on(
		event: 'shiftclick',
		callback: (x: number, y: number) => void
	): void;

	function on(event: string, callback: any) {
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
		((
			height: number,
			width: number,
			xScale: number,
			yScale: number,
			{x, y}: {x: number; y: number}
		) => {
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
		((
			height: number,
			width: number,
			xScale: number,
			yScale: number,
			{x, y}: {x: number; y: number}
		) => {
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
		const {height, width} = await (window as any).getDimensions();

		const canvas = document.createElement('canvas');

		let dragStart: {x: number; y: number} | null = null;

		canvas.addEventListener('click', async (event) => {
			if (!dragStart) {
				const {x, y} = await (window as any).inverseTransform({
					x: event.pageX - canvas.offsetLeft - canvas.clientLeft,
					y: event.pageY - canvas.offsetTop - canvas.clientTop,
				});

				if (event.shiftKey) {
					(window as any).canvasshiftclick(x, y);
				} else {
					(window as any).canvasclick(x, y);
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
				const {x: x1, y: y1} = await (window as any).inverseTransform({
					x: dragStart.x,
					y: dragStart.y,
				});

				const {x: x2, y: y2} = await (window as any).inverseTransform({
					x: dragEnd.x,
					y: dragEnd.y,
				});

				(window as any).canvasdrag(x1, y1, x2, y2);
			}

			dragStart = null;
		});

		canvas.height = height;
		canvas.style.border = '1px solid rgba(0, 0, 0, 0.1)';
		canvas.width = width;

		document.body.appendChild(canvas);

		return canvas.getContext('2d');
	});

	const canvas = async (
		callback: (context: CanvasRenderingContext2D) => void,
		...args: Array<any>
	): Promise<void> => {
		await page.evaluate(callback, context, ...args);
	};

	canvas.on = on;

	return canvas;
}

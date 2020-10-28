import assert from 'assert';
import fs from 'fs';
import puppeteer from 'puppeteer';

import BruteCollinearPoints from './BruteCollinearPoints';
import FastCollinearPoints from './FastCollinearPoints';
import Point from './Point';

async function getCanvas(
	{
		height = 500,
		width = 500,
		xScale = 32768,
		yScale = 32768,
	}: {
		height: number;
		width: number;
		xScale: number;
		yScale: number;
	} = {
		height: 500,
		width: 500,
		xScale: 32768,
		yScale: 32768,
	}
) {
	const browser = await puppeteer.launch({headless: false});

	const page = await browser.newPage();

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
				y: Math.floor(flipped.y / (yScale / width)),
			};
		}).bind(null, height, width, xScale, yScale)
	);

	const context = await page.evaluateHandle(async () => {
		const {
			height,
			width,
			xScale,
			yScale,
		} = await (window as any).getDimensions();

		const canvas = document.createElement('canvas');

		canvas.height = height;
		canvas.style.border = '1px solid #000';
		canvas.width = width;

		document.body.appendChild(canvas);

		return canvas.getContext('2d');
	});

	return async (
		callback: (context: CanvasRenderingContext2D) => void,
		...args: Array<any>
	): Promise<void> => {
		await page.evaluate(callback, context, ...args);
	};
}

async function main() {
	assert(
		process.argv.length === 3,
		'Expected exactly one argument (an input file)'
	);

	const points: Array<Point> = [];

	const file = process.argv[2];

	const contents = fs
		.readFileSync(file, 'utf8')
		.split(/\r\n|\n/)
		.filter((line) => /\S/.test(line));

	assert(contents.length, 'Expected a non-blank input file');

	const count = parseInt(contents[0], 10);

	assert(!isNaN(count), 'Expected first line to be a count');

	const canvas = await getCanvas();

	for (let i = 1; i <= count; i++) {
		const line = contents[i];

		assert(line, `Expected ${count} x, y pairs`);

		const match = line.match(/^\s*(\d+)\s*(\d+)\s*$/);

		assert(match, `Expected an x, y pair but got ${JSON.stringify(line)}`);

		const point = new Point(parseInt(match[1], 10), parseInt(match[2], 10));

		points.push(point);

		await point.draw(canvas);
	}

	const collinear = process.env.BRUTE
		? new BruteCollinearPoints(points)
		: new FastCollinearPoints(points);

	for (const segment of collinear.segments()) {
		console.log(segment.toString());

		await segment.draw(canvas);
	}

	// TODO: print out code that can be copy-pasted into browser console to draw
	// a canvas.
}

main().catch((error) => {
	console.error(`error: ${error}`);

	process.exit(1);
});

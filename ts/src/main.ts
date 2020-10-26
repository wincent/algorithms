import assert from 'assert';
import fs from 'fs';

import FastCollinearPoints from './FastCollinearPoints';
import Point from './Point';

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

	for (let i = 1; i <= count; i++) {
		const line = contents[i];

		assert(line, `Expected ${count} x, y pairs`);

		const match = line.match(/^\s*(\d+)\s*(\d+)\s*$/);

		assert(match, `Expected an x, y pair but got ${JSON.stringify(line)}`);

		points.push(new Point(parseInt(match[1], 10), parseInt(match[2], 10)));
	}

	const collinear = new FastCollinearPoints(points);

	for (const segment of collinear.segments()) {
		console.log(segment.toString());
	}

	// TODO: print out code that can be copy-pasted into browser console to draw
	// a canvas.
}

main().catch((error) => {
	console.log(`error: ${error}`);

	process.exit(1);
});

const assert = require('assert');
const fs = require('fs');

const KdTree = require('./KdTree');
const Point2D = require('./Point2D');
const PointSET = require('./PointSET');
const RectHV = require('./RectHV');
const getCanvas = require('./getCanvas');

async function main() {
	assert(
		process.argv.length === 3,
		'Expected exactly one argument (an input file)'
	);

	const file = process.argv[2];

	const contents = fs
		.readFileSync(file, 'utf8')
		.trim()
		.split(/\r\n|\n/)
		.filter((line) => /\S/.test(line))
		.map((line) => line.trim());

	assert(contents.length, 'Expected a non-blank input file');

	let points;

	if (process.env.KD) {
		points = new KdTree();
	} else {
		points = new PointSET();
	}

	for (const line of contents) {
		const [first, second, excess] = line.split(/\s+/);
		const x = parseFloat(first);
		const y = parseFloat(second);

		assert(
			!isNaN(x) && !isNaN(y) && !excess,
			'Expected exactly two floats per line'
		);

		points.insert(new Point2D(x, y));
	}

	const canvas = await getCanvas();

	const highlight = (point, color = 'rgba(128, 128, 128, 0.5)') => {
		canvas(
			async (context, ...args) => {
				const [point, color] = args;

				const {x, y} = await window.transform(point);

				const circle = new Path2D();

				circle.arc(x, y, 10, 0, 2 * Math.PI);

				context.strokeStyle = color;

				context.stroke(circle);
			},
			{x: point.x, y: point.y},
			color
		);
	};

	canvas.on('click', (x, y) => {
		const point = new Point2D(x, y);

		points.insert(point);

		points.draw(canvas);
	});

	canvas.on('drag', (x1, y1, x2, y2) => {
		const selection = new RectHV(
			Math.min(x1, x2),
			Math.min(y1, y2),
			Math.max(x1, x2),
			Math.max(y1, y2)
		);

		selection.draw(canvas);

		for (const point of points.range(selection)) {
			console.log(`Range hit: ${point.toString()}`);

			highlight(point, 'rgba(0, 255, 0, 0.8)');
		}
	});

	canvas.on('shiftclick', (x, y) => {
		const point = new Point2D(x, y);

		const nearest = points.nearest(point);

		if (nearest) {
			console.log(`Nearest: ${nearest.toString()}`);

			highlight(nearest);
		}
	});

	points.draw(canvas);
}

main().catch((error) => {
	console.error(`error: ${error}`);

	process.exit(1);
});

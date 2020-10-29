# Tasks

- `yarn`: Installs dependencies.
- `yarn build`: Compiles TypeScript (alternatively, run `make`).
- `yarn go [INPUTFILE]`: Run.
- `yarn go:visual [INPUTFILE]`: Run and show picture in browser.
- `yarn test`: Runs tests (need to add tests to `src/test.ts` in order for this to be useful).
- `yarn usage`: Print usage information.

# Benchmarks

The following show baseline performance for the initial implementation followed by a couple of optimizations that reduced storage requirements. The overall runtime was basically unaffected by the changes.

## Baseline: `e6c66de refactor: shorten compare`

```
node src/main.js sample/input10000.txt  28.61s user 0.12s system 100% cpu 28.679 total
node src/main.js sample/input10000.txt  28.59s user 0.12s system 100% cpu 28.665 total
node src/main.js sample/input10000.txt  28.68s user 0.11s system 100% cpu 28.760 total
```

## Space optimization 1: `567e7be perf: avoid use of Map`

```
node src/main.js sample/input10000.txt  28.48s user 0.13s system 100% cpu 28.543 total
node src/main.js sample/input10000.txt  28.69s user 0.11s system 100% cpu 28.771 total
node src/main.js sample/input10000.txt  28.69s user 0.11s system 100% cpu 28.759 total
```

## Space optimization 2: `6a7be9e perf: avoid temporary array`

```
node src/main.js sample/input10000.txt  28.91s user 0.13s system 100% cpu 29.000 total
node src/main.js sample/input10000.txt  28.63s user 0.12s system 100% cpu 28.709 total
node src/main.js sample/input10000.txt  28.45s user 0.12s system 100% cpu 28.518 total
```

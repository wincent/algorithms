# Tasks

- `yarn`: Installs dependencies.
- `yarn build`: Compiles TypeScript (alternatively, run `make`).
- `yarn go [INPUTFILE]`: Run (eg. `yarn go sample/puzzle04.txt`).
- `yarn test`: Runs tests (need to add tests to `src/test.ts` in order for this to be useful).

# Environment variables

- `env MANHATTAN=1 yarn go [INPUTFILE]`: forces use of MANHATTAN priority function.

# Testing

```sh
find sample -name '*unsolvable*' -print -exec yarn go {} \;

# Note: some of these will be slow and/or run out of memory, especially
# with the Hamming priority function.
find sample -name '*.txt' -not -name '*unsolvable*' -print -exec yarn go {} \;
```

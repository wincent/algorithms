# Tasks

-   `yarn`: Installs dependencies.
-   `yarn build`: Compiles TypeScript (alternatively, run `make`).
-   `yarn go`: Run Monte Carlo simulation; optional params are SIZE and RUNS (eg. `yarn go 1000 10`).
-   `yarn test`: Runs tests (need to add tests to `src/test.ts` in order for this to be useful).
-   `yarn usage`: Print usage information.

# Percolation detection

[Commit fa8811d](https://github.com/wincent/algorithms/commit/fa8811df7dc68fb9a41e7c34704e0ae278cb4ebd) shows one implementation of backwash detection that uses two `UnionFind` instances, effectively doubling the corresponding storage and also the number of operations.

The current state shows an alternate approach that uses a `Map` to track the lowest point on the grid that corresponds to each connected component. The initial implementation of this worked by accident, I think, because it relied on [a bug](https://github.com/wincent/algorithms/commit/ff929f46b9c63e690d2be3e81392edffc0f53a1e) in my implementation of the `UnionFind` data structure.

The basic algorithm is as follows — when opening a site (joining it with zero or more others to form a connected component, or augment an existing one):

1. Use the group leader as a key to look up the lowest point in that component so far.
2. If the added site is lower, update the map to record the new minimum.
3. If the lowest point is on the last row of the grid _and_ the lowest point is full, percolation has occurred.

![](https://raw.githubusercontent.com/wincent/algorithms/master/union-find/percolate/images/detection.png)

The example above illustrates how this works in practice.

As we open sites in the area of `A`, irrespective of the order in which we open them, the `lowest` value will always correspond to the lowest site, because we carefully track the `lowest` value before and after each union. I wrote exhaustive tests using a `permute` function that tries every possible ordering of site-opening to verify that the algorithm works in every case (see [`./src/tests.ts`](./src/tests.ts)).

## Runtime cost

-   For each union we do one `find` to look up the leader (effectively nets out at `O(1)` due to path compression).
-   For each union we do at most one `Map` lookup and a fixed number of arithmetic comparisons.
-   We do one `Map` update per call to `open()`.
-   We do an `isFull` check which is again effectively `O(1)` due to previous path compression.
-   Overall, this add a constant cost per opened site, so does not change the asymptotic growth of the `open()` call.

## Storage cost

-   Our `Map` initially starts empty.
-   The worst case storage corresponds to exactly half the area of the grid, which occurs when we only open sites such that we never produce any connected components (other than the connections with the virtual top site); ie. if we consider to `n` to be the grid size, the storage requirement is bounded by `O(n^2)`, but in practice we can expect the typical case to be much less than that because the overwhelming tendency will be to union with existing components as opposed to starting new ones. To verify this, I added logging of the `Map` size given an `n` of `1000` (ie. a million-site grid) and obtained an average of 197,700 `Map` entries (ie. 19.77 `Map` entries per 100 sites).

![](https://raw.githubusercontent.com/wincent/algorithms/master/union-find/percolate/images/worst-case.png)

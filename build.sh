#!/bin/bash

set -e

yarn build
mkdir build/samples
find samples -name '*.js.txt' -exec sh -c "sed -e '1,/---/ d' {} > build/{}" \;

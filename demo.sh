#!/bin/bash

BOLD=$(tput bold)
GREEN=$(tput setaf 2)
RESET=$(tput sgr0)

expect() {
  echo
  echo
  echo "${BOLD}${GREEN}---[ EXPECTED ] -------------------------------------------------------${RESET}"
  echo
  cat /dev/stdin
}

try() {
  echo
  echo "${BOLD}${GREEN}---[  ACTUAL  ] -------------------------------------------------------${RESET}"
  echo
}

expect <<-HERE
cat examples/abra.txt
ABRACADABRA!
HERE

try
cat examples/abra.txt

expect <<-HERE
cat examples/abra.txt | node src/HexDump.js
41 42 52 41 43 41 44 41 42 52 41 21
96 bits
HERE

try
cat examples/abra.txt | node src/HexDump.js

expect <<-HERE
cat examples/abra.txt | node src/MoveToFront.js - | node src/HexDump.js
41 42 52 02 44 01 45 01 04 04 02 26
96 bits
HERE

try
cat examples/abra.txt | node src/MoveToFront.js - | node src/HexDump.js

expect <<-HERE
cat examples/abra.txt | node src/MoveToFront.js - | node src/MoveToFront.js +
ABRACADABRA!
HERE

try
cat examples/abra.txt | node src/MoveToFront.js - | node src/MoveToFront.js +

expect <<-HERE
cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/HexDump.js
00 00 00 03 41 52 44 21 52 43 41 41 41 41 42 42
128 bits
HERE

try
cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/HexDump.js

expect <<-HERE
cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/BurrowsWheeler.js +
ABRACADABRA!
HERE

try
cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/BurrowsWheeler.js +

# See note in Huffman.test.ts about why the output differs inconsequentially here
# (TL;DR: it depends on the order that priority queues return equal-ranked items).
expect <<-HERE
cat examples/abra.txt | node src/Huffman.js - | node src/HexDump.js
50 49 0d 49 42 51 28 60 00 00 01 8d 5e e6 a8
120 bits
HERE

try
cat examples/abra.txt | node src/Huffman.js - | node src/HexDump.js

expect <<-HERE
cat examples/abra.txt | node src/Huffman.js - | node src/Huffman.js +
ABRACADABRA!

HERE

try
cat examples/abra.txt | node src/Huffman.js - | node src/Huffman.js +

expect <<-HERE
cat examples/us.gif | \
	node src/BurrowsWheeler.js - |  node src/MoveToFront.js - | node src/Huffman.js - | \
	node src/Huffman.js + | node src/MoveToFront.js + | node src/BurrowsWheeler.js + | \
	shasum
cat examples/us.gif | shasum
4a81439e28dba707115accafca2f8cdeec3e0633  -
4a81439e28dba707115accafca2f8cdeec3e0633  -
HERE

try
cat examples/us.gif | \
	node src/BurrowsWheeler.js - |  node src/MoveToFront.js - | node src/Huffman.js - | \
	node src/Huffman.js + | node src/MoveToFront.js + | node src/BurrowsWheeler.js + | \
	shasum
cat examples/us.gif | shasum

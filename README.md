# Burrows-Wheeler

## Scripts

-   `yarn`: installs dependencies.
-   `yarn build`: builds TypeScript files.
-   `yarn clean`: removes build artifacts.
-   `yarn format`: formats files with Prettier.
-   `yarn test`: runs Jest tests.

## Usage

```
cat examples/abra.txt
ABRACADABRA!

cat examples/abra.txt | node src/HexDump.js
41 42 52 41 43 41 44 41 42 52 41 21
96 bits

cat examples/abra.txt | node src/MoveToFront.js - | node src/HexDump.js
41 42 52 02 44 01 45 01 04 04 02 26
96 bits

cat examples/abra.txt | node src/MoveToFront.js - | node src/MoveToFront.js +
ABRACADABRA!

cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/HexDump.js
00 00 00 03 41 52 44 21 52 43 41 41 41 41 42 42
128 bits

cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/BurrowsWheeler.js +
ABRACADABRA!

# See note in Huffman.test.ts about why the output differs inconsequentially here
# (TL;DR: it depends on the order that priority queues return equal-ranked items).
cat examples/abra.txt | node src/Huffman.js - | node src/HexDump.js
50 49 0d 49 42 51 28 60 00 00 01 8d 5e e6 a8
120 bits

cat examples/abra.txt | node src/Huffman.js - | node src/Huffman.js +
ABRACADABRA!

cat examples/us.gif | \
	node src/BurrowsWheeler.js - |  node src/MoveToFront.js - | node src/Huffman.js - | \
	node src/Huffman.js + | node src/MoveToFront.js + | node src/BurrowsWheeler.js + | \
	shasum
4a81439e28dba707115accafca2f8cdeec3e0633  -

cat examples/us.gif | shasum
4a81439e28dba707115accafca2f8cdeec3e0633  -
```

## Results

### Small text file

```
cat examples/abra.txt | wc -c
cat examples/abra.txt | node src/BurrowsWheeler.js - | wc -c
cat examples/abra.txt | node src/MoveToFront.js - | wc -c
cat examples/abra.txt | node src/Huffman.js - | wc -c
cat examples/abra.txt | node src/MoveToFront.js - | node src/BurrowsWheeler.js - | node src/Huffman.js - | wc -c
cat examples/abra.txt | node src/BurrowsWheeler.js - | node src/MoveToFront.js - | node src/Huffman.js - | wc -c
```

| Operations         | Size (bytes) | Example file & size       |
| ------------------ | ------------ | ------------------------- |
| cat                | 12           | abra.txt (12)             |
| BW                 | 16           | abra.txt.bwt (16)         |
| MTF                | 12           | abra.txt.mtf (12)         |
| Huffman            | 15           | abra.txt.huf (15)         |
| MTF > BW > Huffman | 25           | n/a                       |
| BW > MTF > Huffman | 19           | abra.txt.bwt.mtf.huf (19) |

### Medium text file

```
cat examples/amendments.txt | wc -c
cat examples/amendments.txt | node src/BurrowsWheeler.js - | wc -c
cat examples/amendments.txt | node src/MoveToFront.js - | wc -c
cat examples/amendments.txt | node src/Huffman.js - | wc -c
cat examples/amendments.txt | node src/MoveToFront.js - | node src/BurrowsWheeler.js - | node src/Huffman.js - | wc -c
cat examples/amendments.txt | node src/BurrowsWheeler.js - | node src/MoveToFront.js - | node src/Huffman.js - | wc -c
```

| Operations         | Size (bytes) | Example file & size    |
| ------------------ | ------------ | ---------------------- |
| cat                | 18369        | amendments.txt (18369) |
| BW                 | 18373        | n/a                    |
| MTF                | 18369        | n/a                    |
| Huffman            | 10236        | n/a                    |
| MTF > BW > Huffman | 11227        | n/a                    |
| BW > MTF > Huffman | 5544         | n/a                    |

### Large text file

```
cat examples/aesop.txt | wc -c
cat examples/aesop.txt | node src/BurrowsWheeler.js - | wc -c
cat examples/aesop.txt | node src/MoveToFront.js - | wc -c
cat examples/aesop.txt | node src/Huffman.js - | wc -c
cat examples/aesop.txt | node src/MoveToFront.js - | node src/BurrowsWheeler.js - | node src/Huffman.js - | wc -c
cat examples/aesop.txt | node src/BurrowsWheeler.js - | node src/MoveToFront.js - | node src/Huffman.js - | wc -c
```

| Operations         | Size (bytes) | Example file & size           |
| ------------------ | ------------ | ----------------------------- |
| cat                | 191943       | aesop.txt (191943)            |
| BW                 |              | aesop.txt.bwt (191947)        |
| MTF                | 191943       | aesop.txt.mtf (191943)        |
| Huffman            | 49910 (🐛)   | aesop.txt.huf (107988)        |
| MTF > BW > Huffman |              | n/a                           |
| BW > MTF > Huffman |              | aesop.txt.bwt.mtf.huf (66026) |

### Small image data

```
cat examples/us.gif | wc -c
cat examples/us.gif | node src/BurrowsWheeler.js - | wc -c
cat examples/us.gif | node src/MoveToFront.js - | wc -c
cat examples/us.gif | node src/Huffman.js - | wc -c
cat examples/us.gif | node src/MoveToFront.js - | node src/BurrowsWheeler.js - | node src/Huffman.js - | wc -c
cat examples/us.gif | node src/BurrowsWheeler.js - | node src/MoveToFront.js - | node src/Huffman.js - | wc -c
```

| Operations         | Size (bytes) | Example file & size        |
| ------------------ | ------------ | -------------------------- |
| cat                | 12400        | us.gif (12400)             |
| BW                 | 12404        | us.gif.bwt (12404)         |
| MTF                | 12400        | us.gif.mtf (12400)         |
| Huffman            | 12693        | us.gif.huf (12693)         |
| MTF > BW > Huffman | 12707        | n/a                        |
| BW > MTF > Huffman | 12726        | us.gif.bwt.mtf.huf (12726) |

## References

-   https://coursera.cs.princeton.edu/algs4/assignments/burrows/specification.php
-   https://coursera.cs.princeton.edu/algs4/assignments/burrows/faq.php

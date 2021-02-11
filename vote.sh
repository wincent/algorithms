#!/bin/bash

for U in bob jane mary jimmy debbie bram; do
  curl -X POST -H 'Content-Type: application/json' -d "{\"question\":1,\"user\":\"$U\", \"choice\":\"a\"}" http://localhost:9000/vote
done

for U in philip felix laura josefina; do
  curl -X POST -H 'Content-Type: application/json' -d "{\"question\":1,\"user\":\"$U\", \"choice\":\"b\"}" http://localhost:9000/vote
done

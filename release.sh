#!/bin/sh
set -o nounset
set -o errexit

./build.sh
./push-tag.sh

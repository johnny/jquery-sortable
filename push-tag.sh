#!/bin/sh
set -o nounset
set -o errexit

VERSION=`cat VERSION`

git tag $VERSION
git push origin --tags

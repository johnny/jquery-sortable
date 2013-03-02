#!/bin/sh

VERSION=`cat VERSION`

git tag $VERSION
git push origin --tags

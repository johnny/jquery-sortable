#!/bin/sh
set -o nounset
set -o errexit

VERSION=`cat VERSION`

cp README.mkd ..
bundle exec middleman build
git stash
git checkout gh-pages
rm -R js css img
mv build/* .
mv ../README.mkd .
git add .
git commit -am 'Update pages. See main branch for changes'
git push origin gh-pages
git checkout master
git stash pop

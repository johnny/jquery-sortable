#!/bin/sh

cp README.mkd ..
./bin/middleman build
git commit -am 'Update minified file'
git checkout gh-pages
rm -R js css
mv build/* .
mv ../README.mkd .
git add .
git commit -am 'Update pages. See main branch for changes'
git push origin gh-pages
git checkout master

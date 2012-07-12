# A sample Guardfile
# More info at https://github.com/guard/guard#readme

ignore /(_flymake|#.+)\.\w+$/

guard 'livereload' do
  watch(%r{source/.+\.(erb|haml|slim)\z})
  watch(%r{source/js/.+\.(js|coffee)\z})
  watch(%r{source/css/.+\.(sass|css)\z})
end

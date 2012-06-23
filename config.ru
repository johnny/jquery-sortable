require 'rubygems'
require 'haml'

require 'sinatra/base'

$LOAD_PATH.unshift(File.join( File.dirname(__FILE__), "app"))

FILES = %w{app}

FILES.each do |file|
  require file
end

if !App.development?
  use Rack::Auth::Basic, "Restricted Area" do |username, password|
    [username, password] == ['jonas', 'sponas']
  end
else
  require 'rack-livereload'
  use Rack::LiveReload,
  :source => :vendored

  require 'sprockets'
  map '/js' do
    environment = Sprockets::Environment.new
    environment.append_path 'app/js'
    environment.cache = Sprockets::Cache::FileStore.new('tmp')
    run environment
  end
end

require 'sass/plugin/rack'

Sass::Plugin.options.merge!(
                            :cache_location => './tmp/sass-cache',
                            :template_location => './app/sass',
                            :css_location => './public/css',
                            :never_update => !App.development?, 
                            :full_exception => App.development?)
use Sass::Plugin::Rack


use Rack::MethodOverride

run App

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

use Rack::MethodOverride

run App

class App < Sinatra::Base
  set :root, File.expand_path(File.join( File.dirname(__FILE__) , '..'))
  
  configure :development do
    require "sinatra/reloader"

    register Sinatra::Reloader
    FILES.each do |file|
      also_reload 'app/'+file
    end
  end

  get '/' do
    haml :index
  end
  
  class << self
    def development?
      Sinatra::Application.environment == :development
    end
  end
end

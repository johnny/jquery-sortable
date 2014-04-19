###
# Compass
###

# Susy grids in Compass
# First: gem install compass-susy-plugin
# require 'susy'

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
page "/debug.html", :layout => 'debug.haml'
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy (fake) files
# page "/this-page-has-no-template.html", :proxy => "/template-file.html" do
#   @which_fake_page = "Rendering a fake page with a variable"
# end

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Methods defined in the helpers block are available in templates
helpers do
  def escape_file(name)
    html_escape File.read("source/"+ name)
  end
  def example(name)
    content = escape_file("js/examples/"+ name + ".js")
    content.match(/\A\$\(function\s*\(\)\s*\{\s*(.*)\s*\}\s*\)\s*\z/mi)[1].gsub(/^  /, "")
  end
  def show_code_button
    content_tag( :div,
                 content_tag(:i, "", :class => "icon-chevron-down") + " show me the code",
                 :class => "btn btn-primary show-code", "data-toggle" => "button")
  end
  def render_options(type, &block)
    content = File.read('source/js/jquery-sortable.js')
    options = content.match(%r{#{type}Defaults = \{\s*(.*)\s*\}, // end #{type} defaults}mi)[1]
    options.scan(/((?:^\s*\/\/[^\n]*\n)*)^\s*([^:\n]*):\s(fun.*? {2}\}|[^\n]*?),?$/m).
      map do |description, option, default|
      content_tag(:tr, capture_html(option,
                                    html_escape(default.gsub(/\n\s{4}/, "\n")),
                                    description.gsub(/\s*\n?\s*\/\/\s*/, " "),
                                    &block))
    end.join
  end

  def iterate(length, label = "Item", &block)
    @nesting ||= []
    prefix = @nesting.empty? ? '' : @nesting.join('.') + '.'
    0.upto(length-1).map do |i|
      @nesting.push(i)
      out = capture_html(i, "#{label} #{prefix}#{i + 1}", &block)
      @nesting.pop
      out
    end.join
  end

  def file_kb(name)
    (File.size(name)/100.0).round / 10.0 if File.exists?(name)
  end
end

set :css_dir, 'css'

ignore 'css/jquery-sortable.css.sass'

set :js_dir, 'js'

set :images_dir, 'img'

# Build-specific configuration
configure :build do
  filename = 'source/js/jquery-sortable.js'
  VERSION = File.read("VERSION").strip
  updated_file = File.read(filename).gsub(/(^\s\*.*v)[\d\.]+$/, '\1' + VERSION)
  File.open(filename, "w") do |file|
    file.puts updated_file
  end

  require 'closure-compiler'
  File.open('source/js/jquery-sortable-min.js','w') do |file|
    # closure = Closure::Compiler.new(:compilation_level => 'ADVANCED_OPTIMIZATIONS')
    closure = Closure::Compiler.new
    file.puts closure.compile(updated_file)
  end

  `gzip -c source/js/jquery-sortable-min.js > source/js/jquery-sortable-min.js.gz`

  manifest = 'sortable.jquery.json'
  content = File.read(manifest).gsub(/("version": "|blob\/)[\d\.]+/, '\1' + VERSION)
  File.open(manifest, 'w') do |file|
    file.puts content
  end

  # For example, change the Compass output style for deployment
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript

  # Enable cache buster
  # activate :cache_buster

  # Use relative URLs
  # activate :relative_assets

  # Compress PNGs after build
  # First: gem install middleman-smusher
  # require "middleman-smusher"
  # activate :smusher

  # Or use a different image path
  # set :http_path, "/Content/images/"
  set :http_prefix, "/jquery-sortable"
end

if development?
  require 'rack-livereload'
  use Rack::LiveReload,
  :source => :vendored
end

require 'rack/coderay'
use Rack::Coderay, "//pre[@lang]"

# Hack to fix haml output
class Rack::Coderay::Parser
  private
  def coderay_render(text, language) #:nodoc:
    text = text.to_s.gsub(/&#x000A;/i, "\n").gsub("&lt;", '<').gsub("&gt;", '>').gsub("&amp;", '&').gsub("&quot;", '"')
    ::CodeRay.scan(text, language.to_sym).div(self.coderay_options)
  end
end

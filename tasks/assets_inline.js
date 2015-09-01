/*
 * grunt-assets-inline
 * https://github.com/sparanoid/assets-inline
 *
 * Copyright (c) 2015 Tunghsiao Liu
 * Licensed under the MIT license.
 */

/*
 * grunt-html-smoosher
 * https://github.com/motherjones/grunt-html-smoosher
 *
 * Copyright (c) 2013 Ben Breedlove
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  'use strict';

  var cheerio = require('cheerio');
  var path = require('path');
  var url = require('url');
  var uglifyjs = require('uglify-js');

  grunt.registerMultiTask('assets_inline', 'Turn your distribution into something pastable.', function() {

    var options = this.options({
      jsDir: "",
      cssDir: "",
      assetsDir: "",
      minify: false,
      inlineImg: false,
      inlineSvg: true,
      inlineSvgBase64: false,
      includeTag: "",
      assetsUrlPrefix: "",
      verbose: false,
      deleteOriginals: false

    });

    options.cssTags = this.options().cssTags || {
      start: '<style>',
      end: '</style>'
    };

    options.jsTags = this.options().jsTags || {
      start: '<script>',
      end: '</script>'
    };

    var uglifyJS = function(i){return i;};

    if (options.minify){
      uglifyJS = function(input){
        return uglifyjs.minify(input, {fromString: true}).code;
      };
    }

    var processSvg = function(i){return i;};

    processSvg = function(input){
      // replace double quotes with single quotes and remove line breaks for non-base64 SVG inlining.
      return input.replace(/"/g, "'").replace(/(?:\r\n|\r|\n)/g, "");
    };

    var filesToDelete = [];

    this.files.forEach(function(filePair) {
      // Check that the source file exists
      if(filePair.src.length === 0) { return; }

      var $ = cheerio.load(grunt.file.read(filePair.src));

      grunt.log.writeln(('Reading: ').green + path.resolve(filePair.src.toString()));

      $('link[rel="stylesheet"]').each(function () {
        var style = $(this).attr('href');
        if(!style) { return; }
        if(style.match(/^\/\//)) { return; }
        if(style.indexOf(options.includeTag) === -1) { return; }
        style = style.replace(/\?.+$/, "");

        //get attributes to keep them on the new element
        var attributes = getAttributes(this[0]);
        if (attributes.href){
          //don't want to re-include the href
          delete attributes.href;
        }
        if (attributes.rel){
          //don't want to rel
          delete attributes.rel;
        }

        if(url.parse(style).protocol) { return; }
        var filePath = (style.substr(0,1) === "/") ? path.resolve(options.cssDir, style.substr(1)) : path.join(path.dirname(filePair.src), style);
        grunt.log.writeln(('    css: ').cyan + filePath);
        $(this).replaceWith(options.cssTags.start + grunt.file.read(filePath) + options.cssTags.end);

        if (options.deleteOriginals) {
          filesToDelete.push(filePath);
        }
      });

      $('script').each(function () {
        var script = $(this).attr('src');
        if(!script) { return; }
        if(script.match(/^\/\//)) { return; }
        if(script.indexOf(options.includeTag) === -1) { return; }
        if(url.parse(script).protocol) { return; }
        script = script.replace(/\?.+$/, "");

        //get attributes to keep them on the new element
        var attributes = getAttributes(this[0]);
        if (attributes.src){
          delete attributes.src;
        }

        var filePath = (script.substr(0,1) === "/") ? path.resolve(options.jsDir, script.substr(1)) : path.join(path.dirname(filePair.src), script);
        grunt.log.writeln(('     js: ').cyan + filePath);

        //create and replace script with new scipt tag
        $(this).replaceWith(options.jsTags.start + uglifyJS(grunt.file.read(filePath)) + options.jsTags.end);

        if (options.deleteOriginals) {
          filesToDelete.push(filePath);
        }
      });

      if (options.inlineSvg) {
        $('img').each(function () {
          var src = $(this).attr('src');
          if (!src) { return; }
          if (src.match(/^\/\//)) { return; }
          if (url.parse(src).protocol) { return; }

          var filePath = (src.substr(0,1) === "/") ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src), src);
          grunt.log.writeln(('    svg: ').cyan + filePath);

          if (src.match(/.svg$/i)) {
            if (options.inlineSvgBase64) {
              $(this).attr('src', 'data:image/svg+xml;base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));
            } else {
              $(this).attr('src', 'data:image/svg+xml;utf8,' + processSvg(grunt.file.read(filePath)));
            }
          }

          if (options.deleteOriginals) {
            filesToDelete.push(filePath);
          }
        });
      }

      if (options.inlineImg) {
        $('img').each(function () {
          var src = $(this).attr('src');
          if (!src) { return; }
          if (src.match(/^\/\//)) { return; }
          if (src.match(/.svg$/i)) { return; }
          if (url.parse(src).protocol) { return; }

          var filePath = (src.substr(0,1) === "/") ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src), src);
          grunt.log.writeln(('  image: ').cyan + filePath);

          $(this).attr('src', 'data:image/' + src.substr(src.lastIndexOf('.')+1) + ';base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));

          if (options.deleteOriginals) {
            filesToDelete.push(filePath);
          }
        });
      }

      var html = $.html();
      // replace relative path
      html = html.replace(/[.]{2}\//g, options.assetsUrlPrefix);
      grunt.file.write(path.resolve(filePair.dest), html);
      grunt.log.writeln(('Created: ').green + path.resolve(filePair.dest) + '\n');
    });

    // Delete the original files
    if (options.deleteOriginals) {
      filesToDelete.forEach(function(filename) {
        if (grunt.file.exists(filename)) {
          grunt.file.delete(filename);
          grunt.log.writeln(('Removed: ').green + filename);
        }
      });
    }

    function getAttributes(el) {
      var attributes = {};
      for (var index in el.attribs) {
        var attr = el.attribs[index];
        if (options.verbose) {
          grunt.log.writeln(('   attr: ').blue + index + ":" + attr);
        }
        attributes[ index ] = attr;
      }
      return attributes;
    }
  });
};

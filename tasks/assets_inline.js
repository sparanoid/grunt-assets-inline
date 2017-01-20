/*
 * grunt-assets-inline
 * https://github.com/sparanoid/assets-inline
 *
 * Copyright (c) 2017 Tunghsiao Liu
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

  grunt.registerMultiTask('assets_inline', 'Inline external resources into HTML', function() {

    var options = this.options({
      jsDir: "",
      cssDir: "",
      assetsDir: "",
      minify: false,
      inlineImg: false,
      inlineSvg: true,
      inlineSvgBase64: false,
      inlineLinkTags: false,
      includeTag: "",
      assetsUrlPrefix: "",
      verbose: false,
      deleteOriginals: false,
      assetsKeep: "assets-keep",
      assetsDelete: "assets-delete"

    });

    options.cssTags = this.options().cssTags || {
      start: '<style>',
      end: '</style>'
    };

    options.jsTags = this.options().jsTags || {
      start: '<script>',
      end: '</script>'
    };

    var uglifyJS = function (i) { return i; };

    if (options.minify) {
      uglifyJS = function (input) {
        return uglifyjs.minify(input, {fromString: true}).code;
      };
    }

    var processSvg = function (i) { return i; };

    processSvg = function(input){
      // replace double quotes with single quotes and remove line breaks for non-base64 SVG inlining.
      return input.replace(/"/g, "'").replace(/(?:\r\n|\r|\n)/g, "");
    };

    var getAttributes = function (el) {
      var attributes = {};
      for (var index in el.attr) {
        var attr = el.attr[index];
        if (options.verbose) {
          grunt.log.writeln(('   attr: ').blue + index + ":" + attr);
        }
        attributes[ index ] = attr;
      }
      return attributes;
    };

    var filesToDelete = [];

    var checkDelete = function (src) {
      if (src.includes(options.assetsDelete)) {
        return true;
      }

      if (options.deleteOriginals) {
        if (src.includes(options.assetsKeep)) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    this.files.forEach(function(filePair) {
      // Check that the source file exists
      if(filePair.src.length === 0) { return; }

      // init cheerio
      var $ = cheerio.load(grunt.file.read(filePair.src), {
        decodeEntities: false
      });

      grunt.log.writeln(('Reading: ').green + path.resolve(filePair.src.toString()));

      // Assets inside inline `<style>` => inline assets
      $('style[data-assets-inline]').each(function () {
        var style = $(this).html();
        if(!style) { return; }

        var items = [];
        // https://regex101.com/r/yP1yK0/1
        var regex = /url\(["']?(.*?)["']?\)/ig;
        var item;

        while (item = regex.exec(style)) {
          items.push(item[1]);
        }

        items.forEach(function(v) {
          var src = v;
          if (!src) { return; }
          if (src.match(/^\/\//)) { return; }
          if (!src.match(/.svg$/i)) { return; }
          if (url.parse(src).protocol) { return; }
          var deleteOriginal = checkDelete(src);

          var filePath = (src.substr(0,1) === '/') ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);

          if (options.inlineSvgBase64) {
            style = style.replace(src, 'data:image/svg+xml;base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));
          } else {
            style = style.replace(src, 'data:image/svg+xml;utf8,' + processSvg(grunt.file.read(filePath)));
          }

          if (deleteOriginal) {
            grunt.log.writeln((' delete: ').gray + filePath);
            filesToDelete.push(filePath);
          } else {
            grunt.log.writeln(('   keep: ').blue + filePath);
          }
        });

        $(this).text(style);
      });

      // External stylesheets => inline stylesheets
      $('link[rel="stylesheet"]').each(function () {
        var style = $(this).attr('href');
        if(!style) { return; }
        if(style.match(/^\/\//)) { return; }
        if(style.indexOf(options.includeTag) === -1) { return; }
        var deleteOriginal = checkDelete(style);
        style = style.replace(/\?.+$/, "");

        //get attributes to keep them on the new element
        var attributes = getAttributes($(this));
        if (attributes.href){
          //don't want to re-include the href
          delete attributes.href;
        }
        if (attributes.rel){
          //don't want to rel
          delete attributes.rel;
        }

        if(url.parse(style).protocol) { return; }
        var filePath = (style.substr(0,1) === "/") ? path.resolve(options.cssDir, style.substr(1)) : path.join(path.dirname(filePair.src.toString()), style);
        $(this).replaceWith(options.cssTags.start + grunt.file.read(filePath) + options.cssTags.end);

        if (deleteOriginal) {
          grunt.log.writeln((' delete: ').gray + filePath);
          filesToDelete.push(filePath);
        } else {
          grunt.log.writeln(('   keep: ').blue + filePath);
        }
      });

      // Scripts inside `<script>` = inlne scripts
      $('script').each(function () {
        var script = $(this).attr('src');
        if(!script) { return; }
        if(script.match(/^\/\//)) { return; }
        if(script.indexOf(options.includeTag) === -1) { return; }
        if(url.parse(script).protocol) { return; }
        var deleteOriginal = checkDelete(script);
        script = script.replace(/\?.+$/, "");

        //get attributes to keep them on the new element
        var attributes = getAttributes($(this));
        if (attributes.src){
          delete attributes.src;
        }

        var filePath = (script.substr(0,1) === "/") ? path.resolve(options.jsDir, script.substr(1)) : path.join(path.dirname(filePair.src.toString()), script);

        //create and replace script with new scipt tag
        $(this).replaceWith(options.jsTags.start + uglifyJS(grunt.file.read(filePath)) + options.jsTags.end);

        if (deleteOriginal) {
          grunt.log.writeln((' delete: ').gray + filePath);
          filesToDelete.push(filePath);
        } else {
          grunt.log.writeln(('   keep: ').blue + filePath);
        }
      });

      // Assets inside `<link>`, most for favicons
      if (options.inlineLinkTags) {
        $('link').each(function () {
          var src = $(this).attr('href');
          if(!src) { return; }
          if(src.match(/^\/\//)) { return; }
          if(src.indexOf(options.includeTag) === -1) { return; }
          if(url.parse(src).protocol) { return; }
          var deleteOriginal = checkDelete(src);
          src = src.replace(/\?.+$/, '');

          var filePath = (src.substr(0,1) === '/') ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);

          if (src.match(/.svg$/i)) {
            if (options.inlineSvgBase64) {
              $(this).attr('href', 'data:image/svg+xml;base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));
            } else {
              $(this).attr('href', 'data:image/svg+xml;utf8,' + processSvg(grunt.file.read(filePath)));
            }
          }

          if (src.match(/.ico$/i)) {
            $(this).attr('href', 'data:image/x-icon;base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));
          }

          if (src.match(/.(?:png|jpg)$/i)) {
            $(this).attr('href', 'data:image/' + src.substr(src.lastIndexOf('.')+1) + ';base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));
          }

          if (deleteOriginal) {
            grunt.log.writeln((' delete: ').gray + filePath);
            filesToDelete.push(filePath);
          } else {
            grunt.log.writeln(('   keep: ').blue + filePath);
          }
        });
      }

      if (options.inlineSvg) {
        $('img').each(function () {
          var src = $(this).attr('src');
          if (!src) { return; }
          if (src.match(/^\/\//)) { return; }
          if (!src.match(/.svg$/i)) { return; }
          if (url.parse(src).protocol) { return; }
          var deleteOriginal = checkDelete(src);

          var filePath = (src.substr(0,1) === "/") ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);

          if (options.inlineSvgBase64) {
            $(this).attr('src', 'data:image/svg+xml;base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));
          } else {
            $(this).attr('src', 'data:image/svg+xml;utf8,' + processSvg(grunt.file.read(filePath)));
          }

          if (deleteOriginal) {
            grunt.log.writeln((' delete: ').gray + filePath);
            filesToDelete.push(filePath);
          } else {
            grunt.log.writeln(('   keep: ').blue + filePath);
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
          var deleteOriginal = checkDelete(src);

          var filePath = (src.substr(0,1) === "/") ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);

          $(this).attr('src', 'data:image/' + src.substr(src.lastIndexOf('.')+1) + ';base64,' + new Buffer(grunt.file.read(filePath, { encoding: null })).toString('base64'));

          if (deleteOriginal) {
            grunt.log.writeln((' delete: ').gray + filePath);
            filesToDelete.push(filePath);
          } else {
            grunt.log.writeln(('   keep: ').blue + filePath);
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
    filesToDelete.forEach(function(filename) {
      if (grunt.file.exists(filename)) {
        grunt.file.delete(filename);
        grunt.log.writeln(('Removed: ').green + filename);
      }
    });
  });
};

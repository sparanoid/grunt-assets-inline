/*
 * grunt-assets-inline
 * https://github.com/sparanoid/assets-inline
 *
 * Copyright (c) 2019 Tunghsiao Liu
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

  var path = require('path');
  var url = require('url');
  var uglifyjs = require('uglify-js');
  var jsdom = require('jsdom');

  var { JSDOM } = jsdom;

  grunt.registerMultiTask('assets_inline', 'Inline external resources into HTML', function() {

    var options = this.options({
      jsDir: "",
      cssDir: "",
      assetsDir: "",
      minify: false,
      serialize: true,
      inlineImg: false,
      inlineImgFileLimit: undefined,
      inlineSvg: true,
      inlineSvgBase64: false,
      inlineSvgFileLimit: undefined,
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

    var created = {
      files: 0
    };

    var uglifyJS = function(i) { return i; };

    if (options.minify) {
      uglifyJS = function(input) {
        return uglifyjs.minify(input).code;
      };
    }

    var processSvg = function(i) { return i; };

    processSvg = function(input) {
      // replace double quotes with single quotes and remove line breaks for non-base64 SVG inlining.
      return encodeURIComponent(input.replace(/"/g, "'").replace(/(?:\r\n|\r|\n)/g, ""));
    };

    var getAttributes = function(el) {
      var attributes = {};
      for (var index in el.attr) {
        var attr = el.attr[index];
        if (options.verbose) {
          grunt.verbose.writeln(('   attr: ').blue + index + ":" + attr);
        }
        attributes[index] = attr;
      }
      return attributes;
    };

    var filesToDelete = [];

    var checkDelete = function(src) {
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

    var calckAssetsBase = function(path) {
      if (!path) {
        return "";
      }
      if (path.endsWith('/')) {
        return path;
      } else {
        return path + '/';
      }
    }

    this.files.forEach(function(filePair) {
      // Check that the source file exists
      if (filePair.src.length === 0) { return; }

      // init dom
      var dom = new JSDOM(grunt.file.read(filePair.src));
      var doc = dom.window.document;

      grunt.verbose.writeln(('Reading: ').green + path.resolve(filePair.src.toString()));

      // Assets inside inline `<style>` => inline assets
      var styles_dom_assets_inline = doc.querySelectorAll('style[data-assets-inline]');
      if (styles_dom_assets_inline.length) {
        for (var i = 0; i < styles_dom_assets_inline.length; i++) {
          var style = styles_dom_assets_inline[i].textContent;
          if (!style) { return; }

          var items = [];
          // https://regex101.com/r/yP1yK0/1
          var regex = /url\(["']?(.*?)["']?\)/ig;
          var item;

          while (item = regex.exec(style)) {
            items.push(item[1]);
          }

          items.forEach(function(v) {
            var src = v;
            if (!src) {

            } else if (src.match(/^\/\//)) {

            } else if (url.parse(src).protocol) {

            } else if (!src.match(/.svg$/i)) {

            } else {
              var deleteOriginal = checkDelete(src);

              var filePath = (src.substr(0, 1) === '/') ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);

              if (options.inlineSvgBase64) {
                style = style.replace(src, 'data:image/svg+xml;base64,' + Buffer.from(grunt.file.read(filePath, { encoding: null })).toString('base64'));
              } else {
                style = style.replace(src, 'data:image/svg+xml;utf8,' + processSvg(grunt.file.read(filePath)));
              }

              var deleteFlag = (' (will keep)').gray;
              if (deleteOriginal) {
                filesToDelete.push(filePath);
                deleteFlag = (' (will remove)').red;
              }
              grunt.verbose.writeln(('    svg in <style>: ').blue + filePath + deleteFlag);
            }
          });

          styles_dom_assets_inline[i].textContent = style;
        }
      }

      // External stylesheets => inline stylesheets
      var styles_dom_link_stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
      if (styles_dom_link_stylesheets.length) {
        for (var i = 0; i < styles_dom_link_stylesheets.length; i++) {
          var style = styles_dom_link_stylesheets[i].getAttribute('href');
          if (!style) {

          } else if (style.match(/^\/\//)) {

          } else if (style.indexOf(options.includeTag) === -1) {

          } else {
            var deleteOriginal = checkDelete(style);
            style = style.replace(/\?.+$/, "");

            //get attributes to keep them on the new element
            var attributes = getAttributes(styles_dom_link_stylesheets[i]);

            if (attributes.href) {
              //don't want to re-include the href
              delete attributes.href;
            }
            if (attributes.rel) {
              //don't want to rel
              delete attributes.rel;
            }

            if (url.parse(style).protocol) {

            } else {
              var filePath = (style.substr(0, 1) === "/") ? path.resolve(options.cssDir, style.substr(1)) : path.join(path.dirname(filePair.src.toString()), style);
              var assetsBase = calckAssetsBase(options.assetsUrlPrefix);

              styles_dom_link_stylesheets[i].outerHTML = options.cssTags.start + grunt.file.read(filePath).replace(/(\.{2}\/)+/g, assetsBase) + options.cssTags.end;

              var deleteFlag = (' (will keep)').gray;
              if (deleteOriginal) {
                filesToDelete.push(filePath);
                deleteFlag = (' (will remove)').red;
              }
              grunt.verbose.writeln(('     css in <link>: ').blue + filePath + deleteFlag);
            }
          }
        }
      }

      // Scripts inside `<script>` = inlne scripts
      var scripts_dom = doc.querySelectorAll('script');
      if (scripts_dom.length) {
        for (var i = 0; i < scripts_dom.length; i++) {
          var script = scripts_dom[i].getAttribute('src');
          if (!script) {

          } else if (script.match(/^\/\//)) {

          } else if (script.indexOf(options.includeTag) === -1) {

          } else if (url.parse(script).protocol) {

          } else {
            var deleteOriginal = checkDelete(script);
            script = script.replace(/\?.+$/, "");

            //get attributes to keep them on the new element
            var attributes = getAttributes(scripts_dom[i]);
            if (attributes.src) {
              delete attributes.src;
            }

            var filePath = (script.substr(0, 1) === "/") ? path.resolve(options.jsDir, script.substr(1)) : path.join(path.dirname(filePair.src.toString()), script);
            var assetsBase = calckAssetsBase(options.assetsUrlPrefix);

            //create and replace script with new scipt tag
            scripts_dom[i].outerHTML = options.jsTags.start + uglifyJS(grunt.file.read(filePath).replace(/(\.{2}\/)+/g, assetsBase)) + options.jsTags.end;

            var deleteFlag = (' (will keep)').gray;
            if (deleteOriginal) {
              filesToDelete.push(filePath);
              deleteFlag = (' (will remove)').red;
            }
            grunt.verbose.writeln(('          <script>: ').blue + filePath + deleteFlag);
          }
        }
      }

      // Assets inside `<link>`, most for favicons
      if (options.inlineLinkTags) {
        var links_dom = doc.querySelectorAll('link');
        if (links_dom.length) {
          for (var i = 0; i < links_dom.length; i++) {
            var src = links_dom[i].getAttribute('href');

            if (!src) {

            } else if (src.match(/^\/\//)) {

            } else if (src.indexOf(options.includeTag) === -1) {

            } else if (url.parse(src).protocol) {

            } else {
              var deleteOriginal = checkDelete(src);
              src = src.replace(/\?.+$/, '');

              var filePath = (src.substr(0, 1) === '/') ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);

              if (src.match(/.svg$/i)) {
                if (options.inlineSvgBase64) {
                  links_dom[i].setAttribute('href', 'data:image/svg+xml;base64,' + Buffer.from(grunt.file.read(filePath, { encoding: null })).toString('base64'));
                } else {
                  links_dom[i].setAttribute('href', 'data:image/svg+xml;utf8,' + processSvg(grunt.file.read(filePath)));
                }
              }

              if (src.match(/.ico$/i)) {
                links_dom[i].setAttribute('href', 'data:image/x-icon;base64,' + Buffer.from(grunt.file.read(filePath, { encoding: null })).toString('base64'));
              }

              if (src.match(/.(?:png|jpg)$/i)) {
                links_dom[i].setAttribute('href', 'data:image/' + src.substr(src.lastIndexOf('.') + 1) + ';base64,' + Buffer.from(grunt.file.read(filePath, { encoding: null })).toString('base64'));
              }

              var deleteFlag = (' (will keep)').gray;
              if (deleteOriginal) {
                filesToDelete.push(filePath);
                deleteFlag = (' (will remove)').red;
              }
              grunt.verbose.writeln(('   media in <link>: ').blue + filePath + deleteFlag);
            }
          }
        }
      }

      if (options.inlineSvg) {
        var inline_svgs_dom = doc.querySelectorAll('img');
        if (inline_svgs_dom.length) {
          for (var i = 0; i < inline_svgs_dom.length; i++) {
            var item = inline_svgs_dom[i];
            var src = item.src;

            if (!src) {

            } else if (src.match(/^\/\//)) {

            } else if (!src.match(/.svg$/i)) {

            } else if (url.parse(src).protocol) {

            } else {
              var deleteOriginal = checkDelete(src);
              var filePath = (src.substr(0, 1) === "/") ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);
              var fileContent = options.inlineSvgBase64 ? grunt.file.read(filePath, { encoding: null }) : grunt.file.read(filePath);
              var fileSize = fileContent.length / 1024;

              if (options.inlineSvgFileLimit && fileSize > options.inlineSvgFileLimit) {
                grunt.verbose.writeln(('             <svg>: ').blue + filePath + (' (skipped: ' + fileSize.toFixed(2) + ' KB > ' + options.inlineSvgFileLimit + ' KB)').yellow);
              } else {
                if (options.inlineSvgBase64) {
                  item.setAttribute('src', 'data:image/svg+xml;base64,' + Buffer.from(fileContent).toString('base64'));
                } else {
                  item.setAttribute('src', 'data:image/svg+xml;utf8,' + processSvg(fileContent));
                }

                var deleteFlag = (' (will keep)').gray;
                if (deleteOriginal) {
                  filesToDelete.push(filePath);
                  deleteFlag = (' (will remove)').red;
                }
                grunt.verbose.writeln(('             <svg>: ').blue + filePath + deleteFlag);
              }
            }
          }
        }
      }

      if (options.inlineImg) {
        var inline_imgs_dom = doc.querySelectorAll('img');
        if (inline_imgs_dom.length) {
          for (var i = 0; i < inline_imgs_dom.length; i++) {
            var item = inline_imgs_dom[i];
            var src = item.getAttribute('src');

            if (!src) {

            } else if (src.match(/^\/\//)) {

            } else if (url.parse(src).protocol) {

            } else if (src.match(/.svg$/i)) {

            } else {
              var deleteOriginal = checkDelete(src);
              var filePath = (src.substr(0, 1) === "/") ? path.resolve(options.assetsDir, src.substr(1)) : path.join(path.dirname(filePair.src.toString()), src);
              var fileContent = grunt.file.read(filePath, { encoding: null });
              var fileSize = fileContent.length / 1024;

              if (options.inlineImgFileLimit && fileSize > options.inlineImgFileLimit) {
                grunt.verbose.writeln(('             <img>: ').blue + filePath + (' (skipped: ' + fileSize.toFixed(2) + ' KB > ' + options.inlineImgFileLimit + ' KB)').yellow);
              } else {
                item.setAttribute('src', 'data:image/' + src.substr(src.lastIndexOf('.') + 1) + ';base64,' + Buffer.from(fileContent).toString('base64'));

                var deleteFlag = (' (will keep)').gray;
                if (deleteOriginal) {
                  filesToDelete.push(filePath);
                  deleteFlag = (' (will remove)').red;
                }
                grunt.verbose.writeln(('             <img>: ').blue + filePath + deleteFlag);
              }
            }
          }
        }
      }

      if (options.serialize) {
        var html = dom.serialize();
      } else {
        var html = dom.window.document.children[0].outerHTML.replace(/<(\/?)(html|head|body)>/gm, '');
      }

      grunt.file.write(path.resolve(filePair.dest), html);
      created.files++;

      grunt.verbose.writeln(('Created: ').green + path.resolve(filePair.dest) + '\n');
    });

    // Delete the original files
    filesToDelete.forEach(function(filename) {
      if (grunt.file.exists(filename)) {
        grunt.file.delete(filename);
        grunt.verbose.writeln(('Removed: ').green + filename);
      }
    });

    if (created.files > 0) {
      grunt.log.ok(
        created.files + ' ' + grunt.util.pluralize(created.files, 'file/files') + ' created, ' + filesToDelete.length + ' asset ' + grunt.util.pluralize(filesToDelete.length, 'file/files') + ' deleted.'
      );
    } else {
      grunt.log.warn('No files created.');
    }
  });
};

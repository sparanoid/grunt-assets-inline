/*
 * grunt-assets-inline
 * https://github.com/sparanoid/assets-inline
 *
 * Copyright (c) 2019 Tunghsiao Liu
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
  require("time-grunt")(grunt);

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    clean: {
      tests: ['tmp'],
    },

    assets_inline: {
      default_options: {
        files: {
          'tmp/default_options.html': 'test/fixtures/index.html',
        },
      },
      minify: {
        options: {
          minify: false,
          inlineImg: false,
          inlineSvg: false,
          inlineSvgBase64: false
        },
        files: {
          'tmp/minify.html': 'test/fixtures/index.html',
        },
      },
      inline_img: {
        options: {
          minify: false,
          inlineImg: true,
          inlineSvg: false,
          inlineSvgBase64: false
        },
        files: {
          'tmp/inline_img.html': 'test/fixtures/index.html',
        },
      },
      inline_svg: {
        options: {
          minify: false,
          inlineImg: false,
          inlineSvg: true,
          inlineSvgBase64: false
        },
        files: {
          'tmp/inline_svg.html': 'test/fixtures/index.html',
        },
      },
      inline_svg_base64: {
        options: {
          minify: false,
          inlineImg: false,
          inlineSvg: true,
          inlineSvgBase64: true
        },
        files: {
          'tmp/inline_svg_base64.html': 'test/fixtures/index.html',
        },
      },
      include_tag: {
        options: {
          minify: false,
          inlineImg: false,
          inlineSvg: false,
          inlineSvgBase64: false,
          includeTag: "?assets-inline"
        },
        files: {
          'tmp/include_tag.html': 'test/fixtures/index.html',
        },
      },
      size_limit: {
        options: {
          minify: false,
          inlineImg: true,
          inlineImgFileLimit: 40,
          inlineSvg: true,
          inlineSvgBase64: true,
          inlineSvgFileLimit: 2
        },
        files: {
          'tmp/size_limit.html': 'test/fixtures/index.html',
        },
      },
      fragment: {
        options: {
          minify: false,
          serialize: false,
          inlineImg: true,
          inlineSvg: true,
          inlineSvgBase64: true,
          inlineLinkTags: true,
        },
        files: {
          'tmp/fragment.html': 'test/fixtures/index-fragment.html',
        },
      },
      all: {
        options: {
          jsDir: "",
          cssDir: "",
          assetsDir: "",
          minify: true,
          inlineImg: true,
          inlineSvg: true,
          inlineSvgBase64: true,
          inlineLinkTags: true,
          includeTag: "",
          assetsUrlPrefix: "/lab/test/"
        },
        files: {
          'tmp/all.html': 'test/fixtures/index.html',
        },
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: "angular"
        }
      },
      dist: {
        src: "CHANGELOG.md"
      }
    },

    bump: {
      options: {
        files: ["package.json"],
        commitMessage: 'chore: release v%VERSION%',
        commitFiles: ["-a"],
        tagMessage: 'chore: create tag %VERSION%',
        push: false
      }
    },

    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'assets_inline', 'nodeunit']);

  grunt.registerTask('release', 'bump, changelog and publish to npm.', function(type) {
    grunt.task.run([
      'npm-contributors',
      'bump:' + (type || 'patch') + ':bump-only',
      'conventionalChangelog',
      'bump-commit',
      'npm-publish'
    ]);
  });

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

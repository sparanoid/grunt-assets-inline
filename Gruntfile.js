/*
 * grunt-assets-inline
 * https://github.com/sparanoid/assets-inline
 *
 * Copyright (c) 2015 Tunghsiao Liu
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
          'tmp/default_options': 'test/fixtures/index.html',
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
          'tmp/minify': 'test/fixtures/index.html',
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
          'tmp/inline_img': 'test/fixtures/index.html',
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
          'tmp/inline_svg': 'test/fixtures/index.html',
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
          'tmp/inline_svg_base64': 'test/fixtures/index.html',
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
          'tmp/include_tag': 'test/fixtures/index.html',
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
          includeTag: "",
          assetsUrlPrefix: "/lab/test/"
        },
        files: {
          'tmp/all': 'test/fixtures/index.html',
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

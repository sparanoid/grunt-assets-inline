'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.assets_inline = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/default_options');
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  },
  minify: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/minify');
    var expected = grunt.file.read('test/expected/minify');
    test.equal(actual, expected, 'tests minified css');

    test.done();
  },
  inline_img: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/inline_img');
    var expected = grunt.file.read('test/expected/inline_img');
    test.equal(actual, expected, 'tests inline css images');

    test.done();
  },
  inline_svg: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/inline_svg');
    var expected = grunt.file.read('test/expected/inline_svg');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  },
  inline_svg_base64: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/inline_svg_base64');
    var expected = grunt.file.read('test/expected/inline_svg_base64');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  },
  include_tag: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/include_tag');
    var expected = grunt.file.read('test/expected/include_tag');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  },
  all: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/all');
    var expected = grunt.file.read('test/expected/all');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  }
};

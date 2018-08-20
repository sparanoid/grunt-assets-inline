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

    var actual = grunt.file.read('tmp/default_options.html');
    var expected = grunt.file.read('test/expected/default_options.html');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  },
  minify: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/minify.html');
    var expected = grunt.file.read('test/expected/minify.html');
    test.equal(actual, expected, 'tests minified css');

    test.done();
  },
  inline_img: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/inline_img.html');
    var expected = grunt.file.read('test/expected/inline_img.html');
    test.equal(actual, expected, 'tests inline css images');

    test.done();
  },
  inline_svg: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/inline_svg.html');
    var expected = grunt.file.read('test/expected/inline_svg.html');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  },
  inline_svg_base64: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/inline_svg_base64.html');
    var expected = grunt.file.read('test/expected/inline_svg_base64.html');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  },
  include_tag: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/include_tag.html');
    var expected = grunt.file.read('test/expected/include_tag.html');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  },
  size_limit: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/size_limit.html');
    var expected = grunt.file.read('test/expected/size_limit.html');
    test.equal(actual, expected, 'tests image size limit');

    test.done();
  },
  all: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/all.html');
    var expected = grunt.file.read('test/expected/all.html');
    test.equal(actual, expected, 'tests inline images');

    test.done();
  }
};

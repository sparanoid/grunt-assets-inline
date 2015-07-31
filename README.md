# grunt-html-smoosher
[![Build Status](https://api.travis-ci.org/sparanoid/grunt-html-smoosher.svg?branch=master)](https://travis-ci.org/sparanoid/grunt-html-smoosher)

> A grunt task which takes a html file, finds all the css and js links, and outputs a version with all the css and js written inline for ease of pasting into a cms

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-html-smoosher --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-html-smoosher');
```

## The "smoosher" task

### Overview
In your project's Gruntfile, add a section named `smoosher` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  smoosher: {
    options: {
      jsTags: { // optional
        start: '<script type="text/javascript">', // default: <script>
        end: '</script>'                          // default: </script>
      },
    },
    all: {
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

### Options

#### Script Minification

Minify scripts with UglifyJS.

```js

grunt.initConfig({
  smoosher: {
    all: {
      options: {
        minify: true
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### Path config

When you have absolute paths for your external assets, it helps to add the local address of your asset files; relative to uncompiled HTML file.

```js
grunt.initConfig({
  smoosher: {
    all: {
      options: {
        jsDir: "../",
        cssDir: "/Library/documents/sharedAssets/"
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

**Example**

If the local cwd for your uncompiled file is `/Library/documents/server/src/html` then the above settings would resolve:

`<script src="/assets/js/script.js" />` will use a local file at `/Library/documents/server/src/js/script.js`

`<link href="/assets/css/styles.css" />` will use a local file at `/Library/documents/sharedAssets/assets/css/styles.css`

#### Ignore images

If you want to smoosh `img` sources to Base64 in HTML, you can set `ignoreImg` to false

```js
grunt.initConfig({
  smoosher: {
    all: {
      options: {
        ignoreImg: false
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### Additional Assets URL Prefix

If `ignoreImg` is set to false (by default) and you have assets in CSS (for example images, fonts, SVGs), smooshing CSS into HTML may break relative URLs, so you may have to replace the original URLs to absolute URLs.

This option only searchs for URLs begin with `../`.

```js
grunt.initConfig({
  smoosher: {
    all: {
      options: {
        assetsUrlPrefix: '<%= config.base %>/assets/'
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### cssTags

Defaults to

```js
{
  start: '<style>',
  end: '</style>'
}
```

#### jsTags

Defaults to

```js
{
  start: '<script>',
  end: '</script>'
}
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- 2015-07-31   v0.1.5   Add `assetsUrlPrefix` support for fixing relative assets URLs in smooshed CSS
- 2015-07-28   v0.1.4   Add `ignoreImg` support
- 2015-07-20   v0.1.3   Add `includeTag` support, only selected files will be smooshed if this option is defined

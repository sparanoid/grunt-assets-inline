# grunt-assets-inline
[![Greenkeeper badge](https://badges.greenkeeper.io/sparanoid/grunt-assets-inline.svg)](https://greenkeeper.io/)
[![Build Status](https://api.travis-ci.org/sparanoid/grunt-assets-inline.svg?branch=master)](https://travis-ci.org/sparanoid/grunt-assets-inline)
[![Dependency Status](https://david-dm.org/sparanoid/grunt-assets-inline.svg)](https://david-dm.org/sparanoid/grunt-assets-inline)
[![devDependency Status](https://david-dm.org/sparanoid/grunt-assets-inline/dev-status.svg)](https://david-dm.org/sparanoid/grunt-assets-inline#info=devDependencies)
[![npm Version](https://img.shields.io/npm/v/grunt-assets-inline.svg)](https://www.npmjs.com/package/grunt-assets-inline)
[![npm Downloads](https://img.shields.io/npm/dm/grunt-assets-inline.svg)](https://www.npmjs.com/package/grunt-assets-inline)

> A grunt task which takes a html file, finds all the css, js links and images, and outputs a version with all the css, js and images (Base64) written inline.

This is a fork of original [grunt-html-smoosher](https://github.com/motherjones/grunt-html-smoosher) by [Ben Breedlove](https://github.com/benbreedlove) with fixes and new features.

## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-assets-inline --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-assets-inline');
```

## The "assets_inline" task

### Overview

In your project's Gruntfile, add a section named `assets_inline` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  assets_inline: {
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

#### `minify`

Defaults to `false`.

Minify scripts with UglifyJS.

```js

grunt.initConfig({
  assets_inline: {
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

Defaults to `""`.

When you have absolute paths for your external assets, it helps to add the local address of your asset files; relative to uncompiled HTML file.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        jsDir: "../",
        cssDir: "/project/styles/",
        assetsDir: "/project/"
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

**Example**

If the local cwd for your uncompiled file is `/project/html` then the above settings would resolve:

`<script src="/assets/js/script.js">` will use a local file at `/project/js/script.js`

`<link href="/assets/css/styles.css">` will use a local file at `/project/styles/assets/css/styles.css`

`<img src="/assets/svg/header.svg">` will use a local file at `/project/assets/svg/header.svg`

#### `inlineImg`

Defaults to `false`.

If you want to smoosh `img` sources to Base64 in HTML, you can set `inlineImg` to true.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        inlineImg: true
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### `inlineImgFileLimit`

Defaults to `undefined`.

If you want to smoosh `img` only smaller than certain size, use `inlineImgFileLimit`.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        inlineImg: true,
        inlineImgFileLimit: 20 // 20 KB
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### `inlineSvg`

Defaults to `true`.

If you want to smoosh SVGs in `img` tags in HTML, you can set `inlineSvg` to true.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        inlineSvg: true
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

`<img src="src/to/header.svg">` will turn into `<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='2175...`.

#### `inlineSvgFileLimit`

Defaults to `undefined`.

If you want to smoosh `svg` only smaller than certain size, use `inlineSvgFileLimit`.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        inlineSvg: true,
        inlineSvgFileLimit: 40 // 40 KB
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### `inlineSvgBase64`

Inline SVGs with Base64. Defaults to `false`.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        inlineSvg: true,
        inlineSvgBase64: true
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

SVG images are inlined directly into HTML by default. To have more compatibility with older browsers, you can also Base64 SVGs:

`<img src="src/to/header.svg">` will turn into `<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0...`.

Please note that Base64 generated files are always slightly bigger than the original files.

#### `inlineLinkTags`

Inline `link` Tags. Defaults to `false`.

If you want to smoosh images inside your `link` tags, for example favicons, you can set `inlineLinkTags` to true.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        inlineLinkTags: true
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

#### `assetsUrlPrefix`

Additional Assets URL Prefix. If you have assets in CSS or JS (for example images, fonts, SVGs), smooshing CSS or JS into HTMLs may break relative URLs, so you may have to replace the original URLs to absolute URLs.

This option only searchs for URLs begin with `../`.

```js
grunt.initConfig({
  assets_inline: {
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

#### `includeTag`

Defaults to `""`.

```js
grunt.initConfig({
  assets_inline: {
    all: {
      options: {
        includeTag: "?assets-inline"
      },
      files: {
        'dest-index.html': 'source-index.html',
      },
    },
  },
});
```

By default all CSS and JS files are smooshed in HTML, If you only need specific files to be smooshed, you should define `includeTag`.

For example the above configuration only smoosh filenames with `?assets-inline` queries:

```html
<link href="/assets/css/styles.css?assets-inline">
```

#### `cssTags`

Defaults to

```js
{
  start: "<style>",
  end: "</style>"
}
```

#### `jsTags`

Defaults to

```js
{
  start: "<script>",
  end: "</script>"
}
```

#### `deleteOriginals`

Defaults to

```js
{
  deleteOriginals: false
}
```

You can delete smooshed files after the main task. Please note that once a file is smooshed into the HTML, it will marked as pending delete, no matter if it is included elsewhere without smooshing.

#### `verbose`

Defaults to

```js
{
  verbose: false
}
```

Get detailed output log.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- See `CHANGELOG.md` for further release history
- 2015-08-12   v0.1.7   Add `assetsDir`, `inlineSvg`, and `inlineSvgBase64` support
- 2015-07-31   v0.1.6   Fix test and new default for `assetsUrlPrefix`
- 2015-07-31   v0.1.5   Add `assetsUrlPrefix` support for fixing relative assets URLs in smooshed CSS
- 2015-07-28   v0.1.4   Add `ignoreImg` support
- 2015-07-20   v0.1.3   Add `includeTag` support, only selected files will be smooshed if this option is defined

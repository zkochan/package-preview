# package-preview

> Creates a production preview of a package

[![npm version](https://img.shields.io/npm/v/package-preview.svg)](https://www.npmjs.com/package/package-preview)
[![Status](https://travis-ci.org/zkochan/package-preview.svg?branch=master)](https://travis-ci.org/zkochan/package-preview "See test builds")

How many times have you published version `1.0.0` of your new fancy package and it didn't work when you installed it as a dependency?
This is because what you test locally is not what gets published to the npm registry.
With `package-preview` you'll always test exactly the same version of the package that is going to be installed as a dependency.

## Background

There are many ways a package can work locally but break after it's been published.

* a file needed by the package is not added to the [files](https://docs.npmjs.com/files/package.json#files) field of `package.json`.
* prod dependencies are accidentally installed as dev dependencies
* installation lifecycle scripts fail
* bins are incorrectly declared
* the main file is not specified correctly

These issues are mostly missed during development and testing because the content of the local package differs from the one
that is packed and published. `package-preview` packs your project and installs it the way it's going to be installed
as a dependency, so you can test the exact same package content that is going to be installed by Node.js package managers.

## Install

```
npm install -D package-preview
```

## Usage

Lets' say your package is called `awesome`. In its `package.json`, run `preview` before running your tests:

```json
{
  "name": "awesome",
  "version": "1.0.0",
  "scripts": {
    "test": "preview && tape test.js"
  }
}
```

`package-preview` is going to create the preview version of your package and link it into your project's `node_modules`.
So in your tests, you can require `awesome` and test the production version of your package:

```js
// Instead of require('.')
const awesome = require('awesome')

assert(awesome() === 'Awesome stuff!')
```

## License

[MIT](LICENSE) © [Zoltan Kochan](https://www.kochan.io)

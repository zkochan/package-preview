# package-preview

> Creates a production preview of a package

[![npm version](https://img.shields.io/npm/v/package-preview.svg)](https://www.npmjs.com/package/package-preview)
[![Status](https://travis-ci.org/zkochan/package-preview.svg?branch=master)](https://travis-ci.org/zkochan/package-preview "See test builds")

## Background

There are many ways a package can work locally but break after it's been published.

* a file needed by the package is not added to the [files](https://docs.npmjs.com/files/package.json#files) field of `package.json`.
* prod dependencies are accidentally installed as dev dependencies
* installation lifecycle scripts fail
* bins are incorrectly declared

These issues are mostly missed during development and testing because the content of the local package differs from the one
that is packed and published. `package-preview` packs your project and installs it the way it's going to be installed
as a dependency, so you can test the exact same package content that is going to be installed by Node.js package managers.

## Install

```
npm install package-preview
```

## Usage

In the `package.json`, add a `pretest` script:

```json
{
  ...
  "scripts": {
    ...
    "pretest": "package-preview",
    ...
  },
  ...
}
```

`package-preview` is going to create the preview version of your package and link it into `node_modules/package-preview`.
So in your tests, you can now require `package-preview` and test the production version of your package.

Example:

```js
// Instead of require('.')
const sum = require('sum')

assert(sum(1 + 2) === 3)
```

## License

[MIT](LICENSE) © [Zoltan Kochan](https://www.kochan.io)

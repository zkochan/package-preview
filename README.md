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
* packages are required in code but not declared in `package.json`
* installation lifecycle scripts fail
* bins are incorrectly declared
* the main file is not specified correctly

These issues are mostly missed during development and testing because the content of the local package differs from the one
that is packed and published. `package-preview` packs your project and installs it the way it's going to be installed
as a dependency, so you can test the exact same package content that is going to be installed by Node.js package managers.

However, some issues can be missed even when a package is published. From version 3, npm creates a flat `node_modules` structure,
as a result, your project has access to packages that are not declared in its `package.json`. Luckily, there is an alternative
package manager which is more strict - [pnpm](https://github.com/pnpm/pnpm). `pnpm` creates a strict, nested `node_modules` structure
and `package-preview` uses it for installing depenencies for the preview.
You can read more about pnpm's strictenss and how it helps to avoid silly bugs in [this](https://www.kochan.io/nodejs/pnpms-strictness-helps-to-avoid-silly-bugs.html) article.

## Install

`package-preview` uses [pnpm](https://github.com/pnpm/pnpm) for installing dependencies for the preview. So install `pnpm`:

```bash
npm install -g pnpm
# or
curl -L https://unpkg.com/@pnpm/self-installer | node
```

Install `package-preview`:

```bash
npm install -D package-preview
# or
pnpm install -D package-preview
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

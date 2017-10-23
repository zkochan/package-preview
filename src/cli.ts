#!/usr/bin/env node
import previewPackage from '.'

const args = process.argv.slice(2)

previewPackage(args[0], args[1])
  .catch(console.error.bind(console))

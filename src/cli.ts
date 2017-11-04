#!/usr/bin/env node
import previewPackage from '.'

const args = process.argv.slice(2)

let what = args[0]
let where = args[1]

if (!what) {
  what = where = process.cwd()
} else if (!where) {
  where = what
}

previewPackage(what, where)
  .catch((err: {code?: number }) => {
    console.error(err)
    process.exit(err.code || 1)
  })

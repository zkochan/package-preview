#!/usr/bin/env node
import meow = require('meow')
import previewPackage from '.'

const cli = meow(`
Usage: preview [what] [where] {OPTIONS}

Options:
      --skip-prepublish  Skips running \`prepublish\` script before publishing preview
         --skip-prepare  Skips running \`prepare\` script before publishing preview
  --skip-prepublishOnly  Skips running \`prepublishOnly\` script before publishing preview
         --skip-prepack  Skips running \`prepack\` script before publishing preview
`)

let what = cli.input[0]
let where = cli.input[1]

if (!what) {
  what = where = process.cwd()
} else if (!where) {
  where = what
}

previewPackage(what, where, cli.flags)
  .catch((err: {code?: number }) => {
    console.error(err)
    process.exit(err.code || 1)
  })

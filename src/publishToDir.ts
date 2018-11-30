import fx = require('fs-extra')
import loadJsonFile from 'load-json-file'
import fs = require('mz/fs')
import path = require('path')
import rimraf = require('rimraf-then')
import unpackStream = require('unpack-stream')
import npmPack from './npmPack'
import npmRun from './npmRun'

export default async function (
  pkgDir: string,
  distDir: string,
  opts: {
    env: object,
    skipPrepack: boolean,
    skipPrepare: boolean,
    skipPrepublish: boolean,
    skipPrepublishOnly: boolean,
  },
) {
  try {
    await clearDistDir(distDir)
    await fx.copy(path.join(pkgDir, 'shrinkwrap.yaml'), path.join(distDir, 'shrinkwrap.yaml'))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  await runPrepublishScripts(pkgDir, opts)
  const tgzFilename = await npmPack(pkgDir)
  const tarball = path.resolve(pkgDir, tgzFilename)
  await fetchFromLocalTarball(tarball, distDir)
  await fs.unlink(tarball)
}

async function fetchFromLocalTarball (tarball: string, dist: string) {
  await unpackStream.local(fs.createReadStream(tarball), dist, {
    generateIntegrity: false,
  })
}

const filesToKeep = new Set(['node_modules', 'shrinkwrap.yaml'])

function clearDistDir (base: string) {
  return fs.readdir(base)
  .then((dirs) => {
    return Promise.all(
      dirs
        .filter((dir) => !filesToKeep.has(dir))
        .map((dir) => path.join(base, dir))
        .map(rimraf),
    )
  })
}

const PREPUBLISH_SCRIPTS = [
  'prepublish',
  'prepare',
  'prepublishOnly',
  'prepack',
]

async function runPrepublishScripts (
  pkgDir: string,
  opts: {
    env: object,
    skipPrepack: boolean,
    skipPrepare: boolean,
    skipPrepublish: boolean,
    skipPrepublishOnly: boolean,
  },
) {
  const pkg = await loadJsonFile<{ scripts: {} }>(path.join(pkgDir, 'package.json'))
  if (!pkg.scripts) return
  const scripts = pkg.scripts

  for (const script of PREPUBLISH_SCRIPTS) {
    if (scripts[script] && !opts[`skip${capitalize(script)}`]) {
      await npmRun(script, pkgDir, opts.env)
    }
  }
}

function capitalize (str: string) {
  return str[0].toUpperCase() + str.substr(1)
}

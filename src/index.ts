import pnpmExec from '@pnpm/exec'
import loadJsonFile = require('load-json-file')
import path = require('path')
import symlinkDir from 'symlink-dir'
import writeJsonFile = require('write-json-file')
import getPreviewDir from './getPreviewDir'
import publishToDir from './publishToDir'

const DEFAULT_OPTIONS = {
  skipPrepack: false,
  skipPrepare: false,
  skipPrepublish: false,
  skipPrepublishOnly: false,
}

export default async function (
  what: string,
  where: string,
  maybeOpts?: {
    skipPrepack?: boolean,
    skipPrepare?: boolean,
    skipPrepublish?: boolean,
    skipPrepublishOnly?: boolean,
  },
) {
  const opts = Object.assign({}, DEFAULT_OPTIONS, maybeOpts)

  const pkgDir = path.resolve(what)
  where = path.resolve(where)

  const previewDir = await getPreviewDir(where, path.basename(pkgDir))
  const pkg = require(path.join(pkgDir, 'package.json'))
  const distDir = path.join(previewDir, pkg.name)

  await publishToDir(pkgDir, distDir, opts)

  const wrapperPkg = {
    dependencies: pkg.peerDependencies || {},
  }

  // Would be better to install the package dirrectly from the tarball
  // in that case this hack would not be needed
  if (pkg.scripts) {
    delete pkg.scripts.prepare
    delete pkg.scripts.prepublish
  }

  await writeJsonFile(path.join(distDir, 'package.json'), pkg)

  await writeJsonFile(path.join(previewDir, 'package.json'), wrapperPkg)

  // This is where the peer dependencies are installed
  await pnpmExec(['install', '--production'], {
    cwd: previewDir,
  })

  // Dependencies in the preview folder are installed during linking
  await pnpmExec(['link', '--production', path.relative(where, distDir)], {
    cwd: where,
  })
}

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
  const opts = {...DEFAULT_OPTIONS, ...maybeOpts}

  const pkgDir = path.resolve(what)
  where = path.resolve(where)

  if (alreadyRunsFor(pkgDir)) {
    throw new Error('package-preview cannot be executed inside another package-preview. ' +
      'You might have a loop somewhere. Try running package-preview with --skip-prepublish or --skip-prepublishOnly flag')
  }

  const subenv = Object.create(process.env)
  subenv.PREVIEW_IS_RUNNING = process.env.PREVIEW_IS_RUNNING
    ? process.env.PREVIEW_IS_RUNNING + path.delimiter + pkgDir
    : pkgDir

  const previewDir = await getPreviewDir(where, path.basename(pkgDir))
  const pkg = require(path.join(pkgDir, 'package.json'))
  const distDir = path.join(previewDir, pkg.name)

  await publishToDir(pkgDir, distDir, {...opts, env: subenv})

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
    env: subenv,
  })

  // Dependencies in the preview folder are installed during linking
  await pnpmExec(['link', '--production', path.relative(where, distDir)], {
    cwd: where,
    env: subenv,
  })
}

function alreadyRunsFor (pkgDir: string) {
  const pkgs = typeof process.env.PREVIEW_IS_RUNNING === 'string'
    ? process.env.PREVIEW_IS_RUNNING!.split(path.delimiter)
    : []
  return pkgs.indexOf(pkgDir) !== -1
}

import pnpmExec from '@pnpm/exec'
import path = require('path')
import symlinkDir from 'symlink-dir'
import writeJsonFile = require('write-json-file')
import getPreviewDir from './getPreviewDir'
import publishToDir from './publishToDir'

export default async function (what: string, where: string) {
  const pkgDir = path.resolve(what)
  where = path.resolve(where)

  const previewDir = await getPreviewDir(where, path.basename(pkgDir))
  const distDir = path.join(previewDir, 'package')

  await publishToDir(pkgDir, distDir)

  const pkg = require(path.join(distDir, 'package.json'))
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

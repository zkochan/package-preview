import path = require('path')
import writeJsonFile = require('write-json-file')
import publishToDir from './publishToDir'
import pnpmExec from './pnpmExec'
import symlinkDir from 'symlink-dir'
import getPreviewDir from './getPreviewDir'

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

  // We don't want to install dev dependencies
  // there has to be a better way, for instance, runnin `pnpm install --production`
  // However, currently `pnpm link` would install all deps, so this hack is needed
  delete pkg.devDependencies

  // Would be better to install the package dirrectly from the tarball
  // in that case this hack would not be needed
  if (pkg.scripts) {
    delete pkg.scripts.prepare
    delete pkg.scripts.prepublish
  }

  await writeJsonFile(path.join(distDir, 'package.json'), pkg)

  await writeJsonFile(path.join(previewDir, 'package.json'), wrapperPkg)

  await pnpmExec({
    prefix: previewDir,
    args: ['install'],
  })

  await pnpmExec({
    prefix: distDir,
    args: ['link']
  })

  await pnpmExec({
    args: ['link', pkg.name],
    prefix: where,
  })
}

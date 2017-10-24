import path = require('path')
import writeJsonFile = require('write-json-file')
import publishToDir from './publishToDir'
import pnpmExec from './pnpmExec'
import symlinkDir from 'symlink-dir'

export default async function (what: string, where: string) {
  const pkgDir = path.resolve(what)
  where = path.resolve(where)

  const previewDir = path.join(pkgDir, '..', `${path.basename(pkgDir)}.preview`)
  const distDir = path.join(previewDir, 'package')

  await publishToDir(pkgDir, distDir)

  const pkg = require(path.join(distDir, 'package.json'))
  const wrapperPkg = {
    dependencies: pkg.peerDependencies || {},
  }
  await writeJsonFile(path.join(previewDir, 'package.json'), wrapperPkg)

  await pnpmExec({
    prefix: previewDir,
    args: ['install'],
  })

  await pnpmExec({
    prefix: distDir,
    args: ['link'] // TODO! , '--production'
  })

  await pnpmExec({
    args: ['link', pkg.name],
    prefix: where,
  })
}

import path = require('path')
import writeJsonFile = require('write-json-file')
import publishToDir from './publishToDir'
import install from './install'
import symlinkDir from 'symlink-dir'

export default async function (what: string, where: string) {
  const pkgDir = path.resolve(what)
  const linkTo = path.resolve(where, 'node_modules')

  const previewDir = path.join(pkgDir, '..', `${path.basename(pkgDir)}.preview`)
  const distDir = path.join(previewDir, 'package')
  await publishToDir(pkgDir, distDir)

  const pkg = require(path.join(distDir, 'package.json'))
  const wrapperPkg = {
    dependencies: Object.assign({},
      pkg.peerDependencies,
      pkg.dependencies
    ),
    optionalDependencies: pkg.optionalDependencies || {},
  }
  await writeJsonFile(path.join(previewDir, 'package.json'), wrapperPkg)
  await install(previewDir)

  await symlinkDir(distDir, path.join(linkTo, pkg.name))
}

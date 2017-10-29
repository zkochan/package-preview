import findDown = require('find-down')
import path = require('path')

const PACKAGE_PREVIEWS_DIRNAME = '__package_previews__'

export default async function (target: string, pkgName: string) {
  // The preview directory should be placed in a directory that doesn't have
  // node_modules or packages up in the directory tree.
  // Otherwise the package would have access to modules that are not declared
  // in its package.json
  const filename = await findDown(['node_modules', 'package.json'], {cwd: target})
  if (filename === null) {
    return path.join(path.dirname(target), PACKAGE_PREVIEWS_DIRNAME, pkgName)
  }
  return path.join(path.dirname(path.dirname(filename)), PACKAGE_PREVIEWS_DIRNAME, pkgName)
}

import fs = require('mz/fs')
import path = require('path')
import npmPack from './npmPack'
import unpackStream = require('unpack-stream')
import rimraf = require('rimraf-then')

export default async function (pkgDir: string, distDir: string) {
  await clearDistDir(distDir) // TODO: copy shrinkwrap.yaml?
  const tgzFilename = await npmPack(pkgDir)
  const tarball = path.resolve(pkgDir, tgzFilename)
  await fetchFromLocalTarball(tarball, distDir)
  await fs.unlink(tarball)
}

async function fetchFromLocalTarball (tarball: string, dist: string) {
  await unpackStream.local(fs.createReadStream(tarball), dist, {
    generateIntegrity: false
  })
}

const filesToKeep = new Set(['node_modules', 'shrinkwrap.yaml'])

function clearDistDir (base: string) {
  return fs.readdir(base)
  .then(dirs => {
    return Promise.all(
      dirs
        .filter(dir => !filesToKeep.has(dir))
        .map(dir => path.join(base, dir))
        .map(rimraf)
    )
  })
}

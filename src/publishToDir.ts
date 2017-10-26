import fx = require('fs-extra')
import fs = require('mz/fs')
import path = require('path')
import rimraf = require('rimraf-then')
import unpackStream = require('unpack-stream')
import npmPack from './npmPack'

export default async function (pkgDir: string, distDir: string) {
  try {
    await clearDistDir(distDir)
    await fx.copy(path.join(pkgDir, 'shrinkwrap.yaml'), path.join(distDir, 'shrinkwrap.yaml'))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

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

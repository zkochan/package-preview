import fs = require('mz/fs')
import path = require('path')
import npmPack from './npmPack'
import unpackStream = require('unpack-stream')

export default async function (pkgDir: string, distDir: string) {
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

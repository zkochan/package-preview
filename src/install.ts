import spawn = require('cross-spawn')

export default async function (prefix: string) {
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpm', ['install', '--production'], {
      cwd: prefix,
      stdio: 'inherit',
    })

    proc.on('error', reject)

    proc.on('close', (code: number) => {
      if (code > 0) return reject(new Error('Exit code ' + code))
      return resolve()
    })
  })
}

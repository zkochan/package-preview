import spawn = require('cross-spawn')

export default async function (
  opts: {
    args: string[],
    prefix: string,
  }
) {
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpm', opts.args, {
      cwd: opts.prefix,
      stdio: 'inherit',
    })

    proc.on('error', reject)

    proc.on('close', (code: number) => {
      if (code > 0) return reject(new Error('Exit code ' + code))
      return resolve()
    })
  })
}

import spawn = require('cross-spawn')

export default function npmPack (
  scriptName: string,
  cwd: string,
  env: object,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn('npm', ['run', scriptName], {
      cwd,
      env,
      stdio: 'inherit',
    })

    proc.on('error', reject)

    proc.on('close', (code: number, signal: number | string | undefined) => {
      if (signal) {
        process.kill(process.pid, signal)
      }
      if (code > 0) {
        return reject(new Error('Exit code ' + code))
      }

      return resolve()
    })
  })
}

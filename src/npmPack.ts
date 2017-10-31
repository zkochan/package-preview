import spawn = require('cross-spawn')

export default function npmPack (dependencyPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['pack'], {
      cwd: dependencyPath,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: object) => {
      stdout += data.toString()
    })
    proc.stderr.on('data', (data: object) => {
      stderr += data.toString()
    })

    proc.on('error', reject)

    proc.on('close', (code: number) => {
      if (code > 0) {
        console.log(stdout)
        console.log(stderr)
        return reject(new Error('Exit code ' + code))
      }

      // The last line contains the generated tgz filename
      stdout = stdout.trim()
      const parts = stdout.split('\n')
      const tgzFilename = parts[parts.length - 1]

      return resolve(tgzFilename)
    })
  })
}

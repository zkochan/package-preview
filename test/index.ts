import execa = require('execa')
import path = require('path')
import test = require('tape')
import packagePreview from 'package-preview'
import tempy = require('tempy')

const fixturesDir = path.join(__dirname, 'fixtures')

test('packagePreview()', async t => {
  const what = path.join(fixturesDir, 'simple')
  const where = tempy.directory()
  packagePreview(what, where)
    .then(() => {
      t.ok(require(`${where}/node_modules/simple/findsProdDep`)())
      t.ok(require(`${where}/node_modules/simple/doesNotFindDevDep`)())
      t.deepEqual(
        require(`${where}/node_modules/simple/output.json`),
        [
          'prepublish',
          'prepare',
          'prepublishOnly',
          'prepack',
        ]
      )
      t.end()
    })
    .catch(t.end)
})

test('fails if prepublish scripts fail', async t => {
  const what = path.join(fixturesDir, 'failing')
  const where = tempy.directory()
  try {
    await execa('node', [require.resolve('package-preview/lib/cli'), what, where])
    t.fail('should have failed')
  } catch (err) {
    t.equal(err.code, 1)
  }
  t.end()
})

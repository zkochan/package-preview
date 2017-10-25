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
      t.end()
    })
    .catch(t.end)
})

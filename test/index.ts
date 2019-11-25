///<reference path="../typings/index.d.ts"/>
import execa = require('execa')
import rimraf = require('rimraf-then')
import path = require('path')
import test = require('tape')
import loadJsonFile = require('load-json-file')
import packagePreview from '../src'
import tempy = require('tempy')
import writeJsonFile = require('write-json-file')

const fixturesDir = path.join(__dirname, 'fixtures')

test('packagePreview()', async t => {
  const what = path.join(fixturesDir, 'simple')
  await rimraf(path.join(what, 'output.json'))
  const where = tempy.directory()
  await writeJsonFile(path.join(where, 'package.json'), {})
  t.comment(`package preview in "${where}"`)

  await packagePreview(what, where)

  t.ok(require(`${where}/node_modules/simple/findsProdDep`)())
  t.ok(require(`${where}/node_modules/simple/doesNotFindDevDep`)())

  t.deepEqual(
    await loadJsonFile(`${where}/node_modules/simple/output.json`),
    [
      'prepublish',
      'prepare',
      'prepublishOnly',
      'prepack',
    ]
  )
  t.end()
})

test('preview --skip-prepublish', async t => {
  const what = path.join(fixturesDir, 'simple')
  await rimraf(path.join(what, 'output.json'))
  const where = tempy.directory()
  await writeJsonFile(path.join(where, 'package.json'), {})

  await packagePreview(what, where, { skipPrepublish: true })

  t.deepEqual(
    await loadJsonFile(`${where}/node_modules/simple/output.json`),
    [
      'prepare',
      'prepublishOnly',
      'prepack',
    ]
  )
  t.end()
})

test('preview --skip-prepare --skip-prepublishOnly --skip-prepack', async t => {
  const what = path.join(fixturesDir, 'simple')
  await rimraf(path.join(what, 'output.json'))
  const where = tempy.directory()
  await writeJsonFile(path.join(where, 'package.json'), {})

  await packagePreview(what, where, {
    skipPrepare: true,
    skipPrepublishOnly: true,
    skipPrepack: true,
  })

  t.deepEqual(
    await loadJsonFile(`${where}/node_modules/simple/output.json`),
    [
      'prepublish',
    ]
  )
  t.end()
})

test('fails if prepublish scripts fail', async t => {
  const what = path.join(fixturesDir, 'failing')
  const where = tempy.directory()
  await writeJsonFile(path.join(where, 'package.json'), {})
  try {
    await execa('node', [require.resolve('package-preview/lib/cli'), what, where])
    t.fail('should have failed')
  } catch (err) {
    t.ok(err)
  }
  t.end()
})

test('install scripts are executed', async t => {
  const what = path.join(fixturesDir, 'with-install-scripts')
  const where = tempy.directory()
  await writeJsonFile(path.join(where, 'package.json'), {})
  packagePreview(what, where)
    .then(() => {
      t.ok(require(`${where}/node_modules/with-install-scripts/createdByPreInstallScript.js`), 'preinstall script executed')
      t.deepEqual(
        require(`${where}/node_modules/with-install-scripts/output.json`),
        [
          'install',
          'postinstall',
        ]
      )
      t.end()
    })
    .catch(t.end)
})

test('fails if another preview is run inside a preview', async t => {
  const what = path.join(fixturesDir, 'loop')
  const where = tempy.directory()
  await writeJsonFile(path.join(where, 'package.json'), {})
  try {
    await packagePreview(what, where)
    t.fail('should have failed')
  } catch (err) {}
  t.end()
})

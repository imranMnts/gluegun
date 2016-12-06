const test = require('ava')
const Runtime = require('../../src/domain/runtime')
const loadPluginFromPackageJson = require('../../src/loaders/package-json-plugin-loader')

test('adds a directory', t => {
  const r = new Runtime()
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/simplest`))
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/threepack`))

  t.is(r.plugins.length, 2)
})

test('gets a list of commands', t => {
  const r = new Runtime()
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/simplest`))
  const p1 = r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/threepack`))
  const c0 = p1.commands[0]
  const list = r.listCommands()

  t.is(list.length, 3)
  t.deepEqual(list[0], { plugin: p1, command: c0 })
})

test('cannot find a command', async t => {
  const r = new Runtime()
  const context = await r.run('bloo', 'blah', {})

  t.truthy(context)
  t.is(context.parameters.full, 'blah')
  t.falsy(context.parameters.array)
  t.falsy(context.parameters.string)
  t.deepEqual(context.parameters.options, {})
  t.falsy(context.result)
  t.falsy(context.error)
})

test('survives exceptions', async t => {
  const r = new Runtime()
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/throws`))
  const context = await r.run('throws', 'throw')

  t.truthy(context)
  t.is(context.parameters.full, 'throw')
  t.deepEqual(context.parameters.array, [])
  t.falsy(context.parameters.string)
  t.deepEqual(context.parameters.options, {})
  t.falsy(context.result)
  t.truthy(context.error)
})

test('runs a command', async t => {
  const r = new Runtime()
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/simplest`))
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/threepack`))
  const context = await r.run('3pack', 'three')

  t.truthy(context)
  t.is(context.parameters.full, 'three')
  t.deepEqual(context.parameters.array, [])
  t.deepEqual(context.parameters.string, '')
  t.deepEqual(context.result, [1, 2, 3])
  t.falsy(context.error)
})

test('can pass arguments', async t => {
  const r = new Runtime()
  r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/args`))
  const context = await r.run('args', 'hello steve kellock', { caps: false })

  t.truthy(context)
  t.is(context.parameters.full, 'hello steve kellock')
  t.deepEqual(context.parameters.array, ['steve', 'kellock'])
  t.deepEqual(context.parameters.string, 'steve kellock')
  t.deepEqual(context.parameters.options, { caps: false })
  t.is(context.result, 'hi steve kellock')
  t.falsy(context.error)
})

test('can read from config', async t => {
  const r = new Runtime()
  const plugin = r.addPlugin(loadPluginFromPackageJson(`${__dirname}/../fixtures/good-plugins/args`))
  const context = await r.run('args', 'config')

  t.falsy(plugin.error)
  t.truthy(plugin.defaults)
  t.is(plugin.defaults.color, 'blue')
  t.truthy(context)
  t.is(context.result, 'blue')
})

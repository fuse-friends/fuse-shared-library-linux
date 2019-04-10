const fs = require('fs')
const { spawn } = require('child_process')
const path = require('path')

const FUSE = path.join(__dirname, 'fuse-3.4.2')
const lib = path.join(FUSE, 'lib/libfuse3.so')
const include = path.join(FUSE, 'include')

module.exports = {
  lib,
  include,
  configure,
  unconfigure,
  beforeMount,
  beforeUnmount,
  isConfigured
}

function beforeMount (cb) {
  if (!cb) cb = noop

  runAll([
    [ path.join(FUSE, 'scripts/init_script.sh') ]
  ], cb)
}

function beforeUnmount (cb) {
  if (!cb) cb = noop
  process.nextTick(cb)
}

function unconfigure (cb) {
  if (!cb) cb = noop
  process.nextTick(cb)
}

function configure (cb) {
  if (!cb) cb = noop

  isConfigured(function (_, yes) {
    if (yes) return cb(null)
    runAll([
      [ 'chmod', '+s', path.join(FUSE, 'scripts/init_script.sh') ],
      [ 'chmod', '+s', path.join(FUSE, 'scripts/install_script.sh') ],
      [ `FUSE_ROOT=${FUSE} ${path.join(FUSE, 'scripts/install_script.sh')}` ]
    ], cb)
  })
}

function isConfigured (cb) {
  fs.stat('/dev/fuse', function (err, st) {
    if (err && err.code !== 'ENOENT') return cb(err)
    cb(null, !!st)
  })
}

function runAll (cmds, cb) {
  loop(null)

  function loop (err) {
    if (err) return cb(err)
    if (!cmds.length) return cb(null)
    run(cmds.shift(), loop)
  }
}

function run (args, cb) {
  const child = spawn(args[0], args.slice(1))

  child.stderr.resume()
  child.stdout.resume()

  child.on('exit', function (code) {
    if (code === 1) return cb(new Error('Could not configure fuse: You need to be root'))
    if (code) return cb(new Error('Could not configure fuse: ' + code))
    cb(null)
  })
}

function noop () {}

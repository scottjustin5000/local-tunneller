
const minimist = require('minimist')
const Stacker = require('./stacker')

;(async function init () {
  const cmdArgs = process.argv.slice(2)

  if (!cmdArgs || !cmdArgs.length) return

  const args = minimist(cmdArgs)
  const cmd = args._[0]

  if (!cmd || (cmd.toLowerCase() !== 'up' && cmd.toLowerCase() !== 'down')) {
    console.error('Invalid command. Valid options are "up" and "down".')
    return
  }
  if (!args.s) {
    console.error('A stack name is required.')
    return
  }
  if (cmd.toLowerCase() === 'up' && !args.k) {
    console.error('An ec2 key pair name is required.')
    return
  }
  const stacker = new Stacker(args.s, args.k)
  if (cmd.toLowerCase() === 'up') {
    await stacker.upsertGame()
  } else {
    await stacker.removeStack()
  }
})()

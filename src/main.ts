#!/usr/bin/env node

import Command from './cli/command'
import Start from './cli/start'
import Stop from './cli/stop'

function main() {
  let command: Command

  switch (process.argv[2]) {
  case void 0:
  case 'start':
    command = new Start()
    break
  case 'stop':
    command = new Stop()
    break
  default:
    console.error(`No such command: ${process.argv[2]}`)
    return
  }

  command.run(process.argv.slice(3))
}

main()

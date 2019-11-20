import { exec } from './shell'

export function start(project: string): void {
  exec('watson stop', { inheritStdout: true, ignoreErrors: true })
  exec(`watson start ${project}`, { inheritStdout: true, inheritStderr: true })
}

export function stop(): void {
  try {
    exec('watson stop', { inheritStdout: true, inheritStderr: true })
  } catch (e) {
    if (exec('watson status', { ignoreErrors: true }) !== 'No project started.\n') {
      throw e
    }
  }
}

export default { start, stop }

import child_process from 'child_process'

export interface ExecOptions {
  inheritStdout?: boolean
  inheritStderr?: boolean
  ignoreErrors?: boolean
}

export function exec(command: string, options?: ExecOptions): string {
  const mergedOptions: ExecOptions = Object.assign({
    inheritStdout: false,
    inheritStderr: false,
    ignoreErrors: false,
  }, options)

  try {
    return child_process.execSync(command, {
      encoding: 'utf-8',
      stdio: [
        'ignore',
        mergedOptions.inheritStdout ? 'inherit' : 'pipe',
        mergedOptions.inheritStderr ? 'inherit' : 'pipe',
      ],
    })
  } catch (e) {
    if (mergedOptions.ignoreErrors) {
      return e.stdout
    }

    throw e
  }
}

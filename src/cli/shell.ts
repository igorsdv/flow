import childProcess, { SpawnSyncReturns, SpawnSyncOptions, SpawnSyncOptionsWithStringEncoding } from 'child_process';

function spawnWithOptions(
  command: string,
  args: string[],
  options: SpawnSyncOptions,
): SpawnSyncReturns<string> {
  const result = childProcess.spawnSync(command, args, {
    encoding: 'utf-8',
    ...options,
  } as SpawnSyncOptionsWithStringEncoding);

  if (result.error) {
    throw result.error;
  }

  return result;
}

export function spawn(
  command: string,
  args?: string[],
  options?: { silent?: boolean },
): SpawnSyncReturns<string> {
  return spawnWithOptions(command, args || [], {
    stdio: options && options.silent ? 'pipe' : 'inherit',
  });
}

export function exec(command: string): string {
  return spawnWithOptions(command, [], { shell: true }).stdout;
}

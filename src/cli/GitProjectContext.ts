import ProjectContext from './ProjectContext';
import childProcess from 'child_process';

export default class GitProjectContext implements ProjectContext {
  async getProject(): Promise<string | null> {
    const command = 'git branch | grep "^*" | egrep -o "[A-Z]+-[0-9]+"';

    const issues = await new Promise<string[]>((resolve) => {
      childProcess.exec(command, (_error, stdout) => {
        resolve(stdout.trim().split('\n'));
      });
    });

    return issues.length === 1 && issues[0] || null;
  }
}

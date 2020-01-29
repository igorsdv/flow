import Issue, { AccountId } from './Issue';
import ContextualizedFrame from './ContextualizedFrame';
import Frame from '../tracking/Frame';

export default class FrameContext {
  private warnings: Map<string, Error>;

  constructor(
    private readonly frames: Frame[],
    private readonly issues: Map<string, Issue>,
    private readonly openAccountIds: Set<AccountId>,
  ) {
    this.warnings = this.generateWarnings();
  }

  getWarnings(): Error[] {
    return [...this.warnings.values()];
  }

  getContextualizedFrames(): ContextualizedFrame[] {
    return this.frames.map((frame) => {
      const { project: issueKey, start, end } = frame;
      const issueSummary = this.issues.get(issueKey)?.summary || null;
      const issueError = this.warnings.get(issueKey)?.message || null;
      const description = '.';

      return ContextualizedFrame.create(
        { issueKey, issueSummary, issueError, description, start, end },
      );
    });
  }

  private generateWarnings(): Map<string, Error> {
    const warnings = new Map<string, Error>();
    const projects = this.frames.map(({ project }) => project);

    for (const project of new Set(projects)) {
      const issue = this.issues.get(project);
      let error;

      if (issue === undefined) {
        error = new Error(`${project} does not exist in JIRA`);
      } else if (issue.account === null) {
        error = new Error(`${project} is not associated to a Tempo account`);
      } else if (!this.openAccountIds.has(issue.account.id)) {
        error = new Error(`${project} is associated to a closed or archived Tempo account`);
      }

      if (error !== undefined) {
        warnings.set(project, error);
      }
    }

    return warnings;
  }
}

import ContextualizedFrameMapper from './ContextualizedFrameMapper';
import Frame from '../tracking/Frame';
import FrameContext from './FrameContext';
import Input from '../io/Input';
import NamedError from '../core/NamedError';
import Output from '../io/Output';
import Synchronizer from './Synchronizer';
import Worklog from './Worklog';

export default class FrameMapper {
  constructor(
    private synchronizer: Synchronizer,
    private contextualizedFrameMapper: ContextualizedFrameMapper,
    private input: Input,
    private output: Output,
  ) {}

  async mapFrames(frames: Frame[]): Promise<Worklog[]> {
    if (frames.length === 0) {
      return [];
    }

    this.output.write('Validating pending issues... ');

    const context = await this.createFrameContext(frames);
    const warnings = context.getWarnings();
    const proceed = await this.shouldProceedWithWarnings(warnings);

    if (!proceed) {
      throw NamedError.createUserAbortError();
    }

    const contextualizedFrames = context.getContextualizedFrames();

    return this.contextualizedFrameMapper.mapContextualizedFrames(contextualizedFrames);
  }

  private async createFrameContext(frames: Frame[]): Promise<FrameContext> {
    const projects = frames
      .map(({ project }) => project)
      .filter((project) => /[A-Z]+-[0-9]+/.test(project));

    const [issues, openAccountIds] = await Promise.all([
      this.synchronizer.getIssuesByKeys([...new Set(projects)]),
      this.synchronizer.getOpenAccountIds(),
    ]);

    return new FrameContext(frames, issues, new Set(openAccountIds));
  }

  private async shouldProceedWithWarnings(warnings: Error[]): Promise<boolean> {
    if (warnings.length === 0) {
      this.output.write('Success.\n');

      return true;
    }

    this.output.write('Found the following errors:\n');

    for (const warning of warnings) {
      this.output.write(`- ${warning.message}\n`);
    }

    this.output.write('\n');

    return this.input.confirm('Do you wish to proceed?', false);
  }
}

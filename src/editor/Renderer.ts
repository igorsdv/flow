import ContextualizedFrame from '../sync/ContextualizedFrame';
import WorklogDuration from '../sync/WorklogDuration';
import moment from 'moment';

type RenderedItem = string | null | RenderedItem[];

function getHeaderComment({ issueSummary }: ContextualizedFrame): RenderedItem {
  if (issueSummary) {
    return `# ${issueSummary.length > 76 ? `${issueSummary.substring(0, 73)}...` : issueSummary}`;
  }

  return null;
}

function renderFrame(frame: ContextualizedFrame): RenderedItem[] {
  const { issueKey, issueError, description, start, end } = frame;

  const duration = new WorklogDuration(moment.duration({ from: start, to: end }));
  const interval = [start, end].map((time) => time.format('k:mm')).join(' - ');

  return [
    getHeaderComment(frame),
    `- issue: ${issueKey}${issueError ? ` # ${issueError}` : ''}`,
    [
      `time: ${duration.asHours()} # ${interval}`,
      `description: ${description}`,
    ],
  ];
}

function renderFramesByDate(framesByDate: Map<string, ContextualizedFrame[]>): RenderedItem[] {
  const header = ['# Don\'t forget to fill the descriptions!', ''];
  const content = [...framesByDate.entries()].flatMap(([date, frames]) => [
    `${date}: # ${moment(date).format('dddd')}`,
    // Add emoty line after each frame
    frames.flatMap((frame) => [...renderFrame(frame), '']),
  ]);

  // Remove last empty line
  return [...header, ...content].slice(0, -1);
}

function renderItem(item: RenderedItem, indent = 0): string {
  if (item === null) {
    return '';
  }

  if (typeof item === 'string') {
    return `${(' '.repeat(indent) + item).trimRight()}\n`;
  }

  return item.map((item) => renderItem(item, indent + 2)).join('');
}

export default class Renderer {
  static renderFrames(framesByDate: Map<string, ContextualizedFrame[]>): string {
    return renderFramesByDate(framesByDate).map((item) => renderItem(item)).join('');
  }
}

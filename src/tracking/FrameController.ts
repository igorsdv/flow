import Frame from './Frame';
import FrameRepository from './FrameRepository';
import PendingFrame from './PendingFrame';
import moment from 'moment';

export default class FrameController {
  constructor(private frameRepository: FrameRepository) {}

  async start(issue: string, stopCallback?: (stoppedFrame: Frame) => void): Promise<PendingFrame> {
    const stoppedFrame = await this.stop();

    if (stopCallback !== undefined && stoppedFrame !== null) {
      stopCallback(stoppedFrame);
    }

    const newFrame = PendingFrame.create({ project: issue, start: moment() }).getOrThrow();

    await this.frameRepository.save(newFrame);

    return newFrame;
  }

  async stop(): Promise<Frame | null> {
    const currentFrame = await this.frameRepository.getCurrent();

    if (currentFrame !== null) {
      const completedFrame = currentFrame.complete().getOrThrow();

      await this.frameRepository.save(completedFrame);

      return completedFrame;
    }

    return null;
  }
}

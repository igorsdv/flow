import Command from './command'
import watson from './watson'

export default class Stop extends Command {
  async run(): Promise<void> {
    try {
      watson.stop()
    } catch (e) {
      console.error('Please verify that `watson` is installed.')
    }
  }
}

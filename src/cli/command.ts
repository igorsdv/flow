export default abstract class Command {
  abstract async run(args: string[]): Promise<void>
}

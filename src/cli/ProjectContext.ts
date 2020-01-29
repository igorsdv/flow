export default interface ProjectContext {
  getProject(): Promise<string | null>;
}

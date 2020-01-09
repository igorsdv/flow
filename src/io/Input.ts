export default interface Input {
  confirmProceed(message: string): Promise<boolean>;
}

export default interface Output {
  write(message: string): void;
  clearLine(): void;
}

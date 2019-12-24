export default class Project {
  readonly key: string;

  constructor(key: string) {
    this.key = key.toUpperCase();
  }
}

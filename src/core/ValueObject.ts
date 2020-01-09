export default abstract class ValueObject<T> {
  protected constructor(props: T) {
    Object.assign(this, props);
  }
}

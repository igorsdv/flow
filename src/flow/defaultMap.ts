export default class DefaultMap<K, V> extends Map<K, V> {
  defaultValue: V;

  constructor(defaultValue: V) {
    super();
    this.defaultValue = defaultValue;
  }

  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultValue);
    }

    return Map.prototype.get.call(this, key);
  }
}

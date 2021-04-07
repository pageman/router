function merge<T, S>(target: T, source: S) {
  return Object.assign(target, source);
}

export default merge;

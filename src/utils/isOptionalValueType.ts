function isOptionalValueType<T>(
  value: T | null | undefined,
  type: 'string' | 'number' | 'bigint' | 'boolean'
) {
  return typeof value === type || value == null;
}

export default isOptionalValueType;

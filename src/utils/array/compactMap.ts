function compactMap<CallbackItem, TransformedItem>(
  array: CallbackItem[],
  transformationFunction: (
    item: CallbackItem
  ) => TransformedItem | undefined | null
) {
  const transformedArray: TransformedItem[] = [];
  for (let index = 0; index < array.length; index += 1) {
    const item = array[index];
    const transformedItem = transformationFunction(item);
    if (transformedItem != null) {
      transformedArray.push(transformedItem);
    }
  }
  return transformedArray;
}

export default compactMap;

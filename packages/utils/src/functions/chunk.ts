/** Splits an array into chunks of `chunk_size`; throws RangeError when chunk_size < 1. */
export const chunk = <T>(array: T[], chunk_size: number): T[][] => {
  if (!(chunk_size >= 1)) {
    throw new RangeError(
      `chunk_size must be a positive number, received ${chunk_size}`
    );
  }

  return array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunk_size);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, [] as T[][]);
};

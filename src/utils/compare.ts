const objectsEqual = <T extends Record<string, any>>(o1: T, o2: T) =>
  Object.keys(o1).length === Object.keys(o2).length &&
  Object.keys(o1).every((p: keyof T) => o1[p] === o2[p]);

const arraysEqual = <T extends Record<string, any>>(array1: T[], array2: T[]) =>
  array1.length === array2.length && array1.every((item: T, id: number) => objectsEqual(item, array2[id]));

export default arraysEqual
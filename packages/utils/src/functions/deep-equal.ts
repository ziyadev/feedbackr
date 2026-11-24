type DeepEqual = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
) => boolean;

export const deepEqual: DeepEqual = (obj1, obj2) => {
  if (obj1 === obj2 || (obj1 !== obj1 && obj2 !== obj2)) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  // Intentional: values with different prototypes (e.g. Object.create(null) vs {},
  // class instance vs plain object) are never equal.
  if (Object.getPrototypeOf(obj1) !== Object.getPrototypeOf(obj2)) {
    return false;
  }

  if (obj1 instanceof Date) {
    const [t1, t2] = [obj1.getTime(), (obj2 as Date).getTime()];
    return t1 === t2 || (t1 !== t1 && t2 !== t2);
  }

  if (obj1 instanceof Set) {
    // Pair items one-to-one so the result is symmetric.
    const remaining = [...(obj2 as Set<any>)];
    return (
      obj1.size === remaining.length &&
      [...obj1].every((a) => {
        const i = remaining.findIndex((b) => deepEqual(a, b));
        if (i === -1) return false;
        remaining.splice(i, 1);
        return true;
      })
    );
  }

  if (obj1 instanceof Map) {
    const map2 = obj2 as Map<any, any>;
    return (
      obj1.size === map2.size &&
      [...obj1].every(([k, v]) => map2.has(k) && deepEqual(v, map2.get(k)))
    );
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

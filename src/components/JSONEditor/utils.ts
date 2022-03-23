interface AnyMap {
  [key: string]: any;
}

interface StringMap {
  [key: string]: string;
}

export const generateKey = (defaultName: string, object: AnyMap): string => {
  let key = defaultName;
  let index = 1;
  while (key in object) {
    key = defaultName + index;
    index++;
  }
  return key;
};

export const insertKeyValueAt = <T extends any>(
  object: T,
  index: number,
  key: string,
  value: any
): T => {
  const entries = Object.entries(object);
  entries.splice(index, 0, [key, value]);
  return Object.fromEntries(entries) as T;
};

export const insertKeyValueAfter = <T extends any>(
  object: T,
  refKey: string,
  key: string,
  value: any
): T => {
  const index = Object.keys(object).findIndex((k) => k == refKey) + 1;
  return insertKeyValueAt(object, index, key, value);
};

export const getType = (value: any): string => {
  return value == null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
};

export const createCopy = <T>(value: T): T => {
  switch (getType(value)) {
    case 'array':
      return [...(value as any)] as any as T;
    case 'object':
      return { ...value };
    default:
      return value;
  }
};

export const replaceInArray = <T>(
  array: T[],
  index: number,
  value: any
): T[] => {
  const newArray = array.slice();
  newArray[index] = value;
  return newArray;
};

export const renameKeys = <T extends AnyMap>(
  object: T,
  updates: StringMap
): T => {
  const keyValues = Object.keys(object).map((key) => {
    const newKey = updates[key] || key;
    return { [newKey]: object[key] };
  });
  return Object.assign({}, ...keyValues);
};

export const renameKey = <T extends AnyMap>(
  object: T,
  oldKey: string,
  newKey: string
): T => {
  return renameKeys(object, { [oldKey]: newKey });
};

export const isJsonPath = (query: string): boolean => {
  return query[0] === '.' || query[0] === '[';
};

export const getPathsTree = (query: string): string[] => {
  if (!isJsonPath(query)) query = '.' + query;
  const parts = query
    .replace(/(\.|\[)/g, (g) => ',' + g)
    .split(',')
    .slice(1);
  return parts.reduce((acc, _, i) => {
    return [...acc, parts.slice(0, i + 1).join('')];
  }, Array<string>());
};

const transformObjToDotStrObj = (targetObj) => {
  const resultObj = {};

  const transform = (currentObj, preKeys) => {
    Object.keys(currentObj).forEach((key) => {
      if (isObject(currentObj[key])) {
        transform(currentObj[key], [...preKeys, key]);
      } else {
        resultObj[[...preKeys, key].join(".")] = currentObj[key];
      }
    });
  };
  transform(targetObj, []);
  return resultObj;
};

const isObject = (val) =>
  Object.prototype.toString.call(val) === "[object Object]";

const dotStr = transformObjToDotStrObj({ a: { b: { c: 1 } } });
dotStr;

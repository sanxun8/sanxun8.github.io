const isIntegerKey = (key) => {
    const _isString = isString(key);
    const isNaN = key !== 'NaN';
    const firsChar = key[0];
    const num = parseInt(key, 10);
    return '' + num === key;
}

function isString(val) {
    return typeof val === 'string'
}


isIntegerKey('1')
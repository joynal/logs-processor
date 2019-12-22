const split = require('split');
const through = require('through2');

const saveData = require('./db');

const parseToObject = (str) => {
  const parsed = {};
  const pairs = str.split('|');

  pairs.forEach((pair) => {
    const arr = pair.split(':');
    if (arr.length > 1) parsed[arr[0].trim()] = arr[1].trim();
  });

  return parsed;
};

// will only process tag which has duration
const processTag = (tagName, parsed, store) => {
  if (parsed[tagName] && parsed.duration) {
    const parsedDuration = parseFloat(parsed.duration);
    if (store[parsed[tagName]]) {
      const record = store[parsed[tagName]];
      record.count += 1;
      record.totalDuration += parsedDuration;
      record.averageDuration = record.totalDuration / record.count;
      if (record.maxDuration < parsedDuration) record.maxDuration = parsedDuration;
      if (record.minDuration > parsedDuration) record.minDuration = parsedDuration;
      record.operationType = parsed.operationType.toUpperCase();
      return;
    }

    // eslint-disable-next-line no-param-reassign
    store[parsed[tagName]] = {
      count: 1,
      totalDuration: parsedDuration,
      averageDuration: parsedDuration,
      maxDuration: parsedDuration,
      minDuration: parsedDuration,
      operationType: parsed.operationType.toUpperCase(),
    };
  }
};

const operations = {};
const operationTypes = {};

const end = () => {
  console.log('operation types:');
  console.table(operationTypes, ['count', 'averageDuration', 'maxDuration', 'minDuration']);

  console.log('operations:');
  console.table(operations, ['count', 'averageDuration', 'maxDuration', 'minDuration', 'operationType']);

  saveData(operations);
};

const transform = (buffer, _, next) => {
  const parsed = parseToObject(buffer.toString());
  processTag('operation', parsed, operations);
  processTag('operationType', parsed, operationTypes);
  next();
};

const transformStream = through(transform, end);

process.stdin
  .pipe(split())
  .pipe(transformStream)
  .pipe(process.stdout);

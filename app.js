import split from 'split2';

import { Transform } from 'stream';

import saveData from './db.js';

const logToObject = (logLine) => logLine.split(' | ').reduce((parsed, pairWord) => {
  const [key, value] = pairWord.split(': ');
  if (key && value) return { ...parsed, [key]: value };
  return parsed;
}, {});

const calculateStats = (tags, parsed, init = {}) => tags.reduce((processed, tagName) => {
  if (parsed[tagName] && parsed.duration) {
    const duration = parseFloat(parsed.duration);
    const operationType = parsed.operationType.toLowerCase();

    if (processed[tagName] && processed[tagName][parsed[tagName]]) {
      const record = processed[tagName][parsed[tagName]];
      const count = record.count + 1;
      const totalDuration = record.totalDuration + duration;
      const averageDuration = totalDuration / count;
      return {
        ...processed,
        [tagName]: {
          ...processed[tagName],
          [parsed[tagName]]: {
            ...processed[tagName][parsed[tagName]],
            count,
            operationType,
            totalDuration,
            averageDuration,
            ...(duration > record.maxDuration && { maxDuration: duration }),
            ...(duration < record.minDuration && { minDuration: duration }),
          },
        },
      };
    }

    return {
      ...processed,
      [tagName]: {
        ...processed[tagName],
        [parsed[tagName]]: {
          count: 1,
          operationType,
          totalDuration: duration,
          averageDuration: duration,
          maxDuration: duration,
          minDuration: duration,
        },
      },
    };
  }

  return processed;
}, init);

class StatsAggregator extends Transform {
  constructor() {
    super({ defaultEncoding: 'utf8' });
    this.output = {};
  }

  _transform(chunk, _, next) {
    this.output = calculateStats(
      ['operation', 'operationType'],
      logToObject(chunk.toString()),
      this.output,
    );
    next();
  }

  _flush() {
    console.log('operation types:');
    console.table(this.output.operationType, [
      'count',
      'averageDuration',
      'maxDuration',
      'minDuration',
    ]);

    console.log('operations:');
    console.table(this.output.operation, [
      'count',
      'averageDuration',
      'maxDuration',
      'minDuration',
      'operationType',
    ]);

    saveData(this.output.operation);
  }
}

process.stdin.pipe(split()).pipe(new StatsAggregator());

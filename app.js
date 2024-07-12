import { Transform } from 'stream';
import readline from 'readline';

import saveData from './db.js';

const logToObject = (logLine) => logLine.split(' | ').reduce((parsed, pairWord) => {
  const [key, value] = pairWord.split(': ');
  if (key && value) return { ...parsed, [key]: value };
  return parsed;
}, {});

const calculateStats = (tags, parsed, init = {}) => tags.reduce((processed, tagName) => {
  const tagValue = parsed[tagName];
  if (tagValue && parsed.duration) {
    const duration = parseFloat(parsed.duration);
    const operationType = parsed.operationType.toLowerCase();

    if (processed[tagName] && processed[tagName][tagValue]) {
      const record = processed[tagName][tagValue];
      const count = record.count + 1;
      const totalDuration = record.totalDuration + duration;
      const averageDuration = totalDuration / count;
      return {
        ...processed,
        [tagName]: {
          ...processed[tagName],
          [tagValue]: {
            ...processed[tagName][tagValue],
            count,
            operationType,
            totalDuration,
            averageDuration,
            maxDuration: Math.max(record.maxDuration, duration),
            minDuration: Math.min(record.minDuration, duration),
          },
        },
      };
    }

    return {
      ...processed,
      [tagName]: {
        ...processed[tagName],
        [tagValue]: {
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

const statsAggregator = new StatsAggregator();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  statsAggregator.write(line);
});

rl.on('close', () => {
  statsAggregator.end();
});

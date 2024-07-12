import { Transform } from 'stream';
import readline from 'readline';

import saveData from './db.js';

const logToObject = (logLine) => logLine.split(' | ').reduce((parsed, pairWord) => {
  const [key, value] = pairWord.split(': ');
  if (key && value) return { ...parsed, [key]: value };
  return parsed;
}, {});

const calculateStats = (tags, parsed, init = {}) => {
  if (!parsed.duration) return init;
  const duration = parseFloat(parsed.duration);
  const operationType = parsed.operationType.toLowerCase();

  return tags.reduce((processed, tagName) => {
    const tagValue = parsed[tagName];
    if (!tagValue) return processed;

    const record = processed[tagName]?.[tagValue] || { count: 0, totalDuration: 0 };
    const count = record.count + 1;
    const totalDuration = record.totalDuration + duration;
    const averageDuration = totalDuration / count;

    return {
      ...processed,
      [tagName]: {
        ...processed[tagName],
        [tagValue]: {
          count, totalDuration, averageDuration, operationType,
        },
      },
    };
  }, init);
};

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

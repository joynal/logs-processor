import sqlite3 from 'sqlite3';

const insertQuery = `INSERT INTO GraphqlDurations (
    created,
    operation,
    operationType,
    duration,
    method
  ) VALUES (?,?,?,?,?);`;

const initTable = (database) => {
  database.run(`
    CREATE TABLE IF NOT EXISTS GraphqlDurations (
        id INTEGER PRIMARY KEY,
        created TEXT,
        operation TEXT,
        operationType TEXT,
        duration REAL,
        method TEXT
    )`);

  database.run('DELETE FROM GraphqlDurations;');
};

const createRecords = (database, operationName, operation) => {
  database.run(insertQuery, [
    new Date(),
    operationName,
    operation.operationType,
    operation.averageDuration,
    'AVG',
  ]);
  database.run(insertQuery, [
    new Date(),
    operationName,
    operation.operationType,
    operation.minDuration,
    'MIN',
  ]);
  database.run(insertQuery, [
    new Date(),
    operationName,
    operation.operationType,
    operation.maxDuration,
    'MAX',
  ]);
};

const saveData = (operations) => {
  try {
    const database = new sqlite3.Database('./db.sqlite');

    // every time clear the table
    initTable(database);

    // iterate and save each record
    Object.keys(operations).forEach((key) => {
      createRecords(database, key, operations[key]);
    });
  } catch (error) {
    console.error(error);
  }
};

export default saveData;

# Code Challenge - Logs processing

The goal of this challenge is to get some insights about our software from logs.
The logs have sort of a custom format.
You can choose whatever tool or language you want.
You are also free to spread your solution across a single or multiple files.

In the directory you find a compressed file "logs.log.gz". Some of the log-lines might not be relevant.


## Part 1 - Parsing and processing

The results from the following questions should be written to stdout (eg. with console.log in Node.js or System.out.println in Java)

1. How many queries, mutations and subscriptions have been performed?

2. What are the counts for the different operations?

3. What are the average duration times grouped by
   a) operation type?
   b) operation?

4. What are the max duration times grouped by
   a) operation type?
   b) operation?

5. What are the min duration times grouped by
   a) operation type?
   b) operation?


## Part 2 - SQL (optional)

*Please don't hesitate to skip this part if you feel like you already spend enough time on part 1.
This won't change our decision about your solution and we can solve this exercise together in person on our next meeting.*

You would like to persist the average, min and max metrics per operation (3.b, 4.b, 5.b) in a database using SQL.
You can assume that the following table exists:

```
create table if not exists GraphqlDurations (
  id              char(36)                                    not null  default uuid(),
  created         datetime                                    not null  default current_timestamp(),
  operation       varchar(255)                                not null,
  operationType   enum('QUERY', 'MUTATION', 'SUBSCRIPTION')   not null,
  duration        decimal(6,4)                                not null,
  method          enum('AVG', 'MIN', 'MAX')                   not null
) engine InnoDB charset utf8;
```

Please extend your program to create an SQL file which includes `insert` statements for the aggregated metrics we want to persist.

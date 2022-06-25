## Overview

The program read log file as a stdin and NodeJS streams are compatible with the stdin. So no need to handle filesystem code. It can easily process larger file without any problem(until defined variable's memory allocation exceeds). Saved data to sqlite for simplicity and portability.

## Install packages

```bash
npm i
```

## How to run

After `cat` command place your log file path.

```bash
cat log_file.txt | node app.js
```

## Screenshots

App:
<p align="center">
  <img src="images/app.png"/>
</p>

DB:
<p align="center">
  <img src="images/db.png"/>
</p>

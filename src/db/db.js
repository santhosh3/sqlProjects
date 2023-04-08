const env = require("../env.json");
const { Pool } = require('pg');

const pool = new Pool({
  user: env.USERNAME,
  host: env.HOST,
  database: env.DATABASE,
  password: env.PASSWORD,
  port: env.PORT,
});

module.exports = pool;
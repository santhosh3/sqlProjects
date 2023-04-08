const pool = require('../db/db');

const createBoolTableQuery = `
  CREATE TABLE IF NOT EXISTS book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    excerpt VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    isbn VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255)[] NOT NULL,
    reviews INTEGER DEFAULT 0,
    deleted_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    released_at VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

const createBookTable = async () => await pool.query(createBoolTableQuery);

module.exports = {
   createBookTable
};

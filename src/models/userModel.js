const pool = require('../db/db');

const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    title VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(15) NOT NULL CHECK (LENGTH(password) >= 8 AND LENGTH(password) <= 15),
    address_id INTEGER REFERENCES address(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_title CHECK (title = 'Mr' OR title = 'Mrs' OR title = 'Miss')
  );
`;

const createUserAddressQuery = `
  CREATE TABLE IF NOT EXISTS address (
  id SERIAL PRIMARY KEY,
  street TEXT,
  city TEXT,
  pincode TEXT
);
`;


const createUserTable = async () => {
  await pool.query(createUserTableQuery);
};

const createUserAddressTable = async () => {
  await pool.query(createUserAddressQuery);
}

module.exports = {
  createUserTable,createUserAddressTable
};

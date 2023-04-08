const pool = require('../db/db');

const createReviewTableQuery = `
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES book(id) ON DELETE CASCADE,
    reviewed_by VARCHAR(255) NOT NULL DEFAULT 'Guest',
    reviewed_at TIMESTAMP NOT NULL,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

const createReviewTable = async () => await pool.query(createReviewTableQuery);

module.exports = {
   createReviewTable
};

const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync('./certs/global-bundle.pem').toString(),
    checkServerIdentity: true, 
    rejectUnauthorized: true 
  }
});

// Event listeners for pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('New client connected to the pool');
});

pool.on('remove', () => {
  console.log('Client removed from the pool');
});

module.exports = pool;

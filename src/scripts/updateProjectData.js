/**
 * Fetch data from an City of Charlotte API and save to the database
 * 
 * Configuration:
 *   Edit the API_URL and TABLE_NAME variables:
 *          API_URL: Url for City of Charlotte API - to get project details
 *          TABLE_NAME: Name of the table in DB to save details to
 * 
 * Usage:
 *   npm run update-project-data
 */

require('dotenv').config();
const pool = require('../config/database');
const { fetchFromCity } = require('../utils/fetchCityData');


// const API_URL = 'https://gis.charlottenc.gov/arcgis/rest/services/CIP/CapitalImprovementProjectsService/MapServer/16/query?where=1=1&outFields=*&f=json';
const API_URL = 'https://gis.charlottenc.gov/arcgis/rest/services/CIP/CapitalImprovementProjectsService/MapServer/16/query?where=ObjectID=1%20OR%20ObjectID=2&outFields=*&f=json'
const TABLE_NAME = 'projects';


/**
 * Transform API response data to array for db insertion
 * @param {any} data - Raw data from API
 * @returns {Array<Object>} - Array of objects ready to insert to db
 */
function transformData(data) {
  
  data = data['features']

  return data
}


/**
 * Save data to the database
 * This is a generic function that inserts data into a table
 * @param {Array<Object>} records - Array of records to insert
 * @param {string} tableName - Target table name
 */
async function saveToDatabase(records, tableName) {
  if (!records || records.length === 0) {
    console.warn('⚠️  Warning: No records to save');
    return;
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Get column names from the first record
    const columns = Object.keys(records[0]);
    const columnList = columns.join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    // Prepare insert query
    const query = `
      INSERT INTO ${tableName} (${columnList})
      VALUES (${placeholders})
      ON CONFLICT DO NOTHING
    `;

    // Insert each record
    let insertedCount = 0;
    for (const record of records) {
      const values = columns.map((col) => record[col]);
      const result = await client.query(query, values);
      if (result.rowCount > 0) {
        insertedCount++;
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`✅ Successfully inserted ${insertedCount} records into ${tableName}`);

    return insertedCount;
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting API fetch and database update operation...\n');

  try {
    // 1. Fetch data from API
    console.log(`Fetching data from: ${API_URL}`);
    const apiResponse = await fetchFromCity(API_URL);
    console.log('Data fetched successfully');
    

    // 2. Transform data
    console.log('\nTransforming data');
    const projects = transformData(apiResponse);
    console.log(`Retrieved ${projects.length} projects`);


  //   // 3. Save to database
  //   console.log(`\n💾 Saving to database table: ${TABLE_NAME}`);
  //   const savedCount = await saveToDatabase(records, TABLE_NAME);

  //   console.log('\n✨ Operation completed successfully!');
  //   console.log(`📊 Summary: ${savedCount} records saved to ${TABLE_NAME}`);
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

module.exports = { saveToDatabase, transformData};

main();

/**
 * Fetch data from an City of Charlotte API, Clean up the data, and save to Database
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


const API_URL = 'https://gis.charlottenc.gov/arcgis/rest/services/CIP/CapitalImprovementProjectsService/MapServer/16/query?where=1=1&outFields=*&f=json';
const TABLE_NAME = 'projects';


/**
 * Transform API response data to array for db insertion
 * @param {any} data - Raw data from API
 * @returns {Array<Object>} - Array of objects ready to insert to db
 */
function transformData(data) {

  //Concatenates Start/End Date and Year
  data = data['features'].map(item => {
    item.attributes.Start_Date = item.attributes.Anticipated_Start_Date_Year 
      ? `${item.attributes.Anticipated_Start_Date} ${item.attributes.Anticipated_Start_Date_Year}`
      : item.attributes.Anticipated_Start_Date;
    item.attributes.End_Date = item.attributes.Anticipated_Compl_Date_Year
      ? `${item.attributes.Anticipated_Compl_Date} ${item.attributes.Anticipated_Compl_Date_Year}`
      : item.attributes.Anticipated_Compl_Date;
    
    delete item.attributes.Anticipated_Start_Date;
    delete item.attributes.Anticipated_Start_Date_Year;
    delete item.attributes.Anticipated_Compl_Date;
    delete item.attributes.Anticipated_Compl_Date_Year;
    
    return item;
  })

  return data
}


/**
 * Save data to the database
 * This is a generic function that inserts data into a table
 * @param {Array<Object>} projects - Array of projects to insert
 * @param {string} tableName - Target table name
 */
async function saveToDatabase(projects, tableName) {
  if (!projects || projects.length === 0) {
    console.warn('Warning: No projects found to save');
    return;
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    const columns = 'project_id, name, description, location_description, start_date, end_date, status, budget, created_at';
    const placeholders = '$1, $2, $3, $4, $5, $6, $7, $8, $9';

    // Prepare insert query
    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})`;

    // Insert each record
    let insertedCount = 0;
    for (const project of projects) {

      if (process.env.NODE_ENV == 'development')
      {
        console.log(project)
      }

      const values = [project.attributes.ObjectID || 'Not Provided', 
                      project.attributes.Project_Name || 'Not Provided', 
                      project.attributes.Public_Project_Description || 'Not Provided', 
                      project.attributes.Location_Description || 'Not Provided',
                      project.attributes.Start_Date || 'Not Provided',
                      project.attributes.End_Date || 'Not Provided',
                      project.attributes.Status || 'Not Provided',
                      project.attributes.Total_Project_Budget || 'Not Provided',
                      new Date().toISOString()];

      const result = await client.query(query, values);

      if (result.rowCount > 0) {
        insertedCount++;
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`Successfully inserted ${insertedCount} records into ${tableName}`);

    return insertedCount;
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.log('Error, Rolling Back Changes...');
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


    // 3. Save to database
    console.log(`\nSaving to database table: ${TABLE_NAME}`);
    const savedCount = await saveToDatabase(projects, TABLE_NAME);
    console.log('\nOperation completed successfully!');
    console.log(`Summary: ${savedCount} projects saved to ${TABLE_NAME} table`);

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

module.exports = { saveToDatabase, transformData};

main();

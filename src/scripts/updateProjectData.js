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


const DETAILS_API_URL = 'https://gis.charlottenc.gov/arcgis/rest/services/CIP/CapitalImprovementProjectsService/MapServer/16/query?where=1=1&outFields=*&f=json';
const GEO_POINTS_API_URL = 'https://gis.charlottenc.gov/arcgis/rest/services/CIP/CapitalImprovementProjectsService/MapServer/18/query?where=1=1&outFields=*&returnGeometry=true&f=geojson';

// const GEO_POINTS_API_URL = 'https://gis.charlottenc.gov/arcgis/rest/services/CIP/CapitalImprovementProjectsService/MapServer/18/query?where=OBJECTID=2684237&outFields=*&returnGeometry=true&f=geojson'

const DETAILS_TABLE_NAME = 'projects';
const GEO_TABLE_NAME = 'geometrics';



/**
 * Transform API response data to array for db insertion
 * @param {any} data - Raw data from API
 * @returns {Array<Object>} - Array of objects ready to insert to db
 */
function transformDetailsData(data) {

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
 * Transform API response data to array for db insertion
 * Looks up project_id in database by ProjectName
 * @param {any} data - Raw data from API
 * @returns {Promise<Array<Object>>} - Array of objects ready to insert to db
 */
async function transformGeoPointData(data) {
  
  const features = data['features'];
  const transformedData = [];
  
  for (const item of features) {
    let projectName = item.properties.ProjectName.trim();
    
    // Replace abbreviations with full names
    projectName = projectName.replace(/\s+dr\s*$/i, ' Drive');
    projectName = projectName.replace(/\s+ave\s*$/i, ' Avenue');
    projectName = projectName.replace(/\s+rd\s*$/i, ' Road');

    
    const result = await pool.query(
      'SELECT project_id FROM projects WHERE name = $1',
      [projectName]
    );
    
    if (result.rows.length > 0) {
      item.project_id = result.rows[0].project_id;
    } else {
      console.warn(`Project not found in DB: "${projectName}"`);
      continue;
    }
    
    delete item.properties;
    transformedData.push(item);
  }

  return transformedData;
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
 * Save geometric data to the database
 * @param {Array<Object>} geometrics - Array of geometric objects to insert
 * @param {string} tableName - Target table name
 */
async function saveGeoToDatabase(geometrics, tableName) {
  if (!geometrics || geometrics.length === 0) {
    console.warn('Warning: No geometric data found to save');
    return;
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    const columns = 'project_id, features, created_at';
    const placeholders = '$1, $2, $3';

    // Prepare insert query
    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})`;

    // Insert each record
    let insertedCount = 0;
    for (const geometric of geometrics) {

      if (process.env.NODE_ENV == 'development')
      {
        console.log(geometric)
      }

      const values = [geometric.project_id || null, 
                      JSON.stringify(geometric.geometry) || 'Not Provided',
                      new Date().toISOString()];

      const result = await client.query(query, values);

      if (result.rowCount > 0) {
        insertedCount++;
      }
    }

    // Commit transaction
    await client.query('COMMIT');

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
    // 1. Fetch details data from API
    console.log(`Fetching project details data from: ${DETAILS_API_URL}`);
    const apiDetailsResponse = await fetchFromCity(DETAILS_API_URL);
    console.log('Data fetched successfully');
    

    // 2. Transform details data
    console.log('\nTransforming project details data');
    const projects = transformDetailsData(apiDetailsResponse);
    console.log(`Retrieved ${projects.length} projects`);


    // 3. Save details data to database
    console.log(`\nSaving to database table: ${DETAILS_TABLE_NAME}`);
    const savedDetailsCount = await saveToDatabase(projects, DETAILS_TABLE_NAME);
    console.log('\nOperation completed successfully!');
    console.log(`Summary: ${savedDetailsCount} projects saved to ${DETAILS_TABLE_NAME} table`);




    // 1. Fetch gemotetry point data from API
    console.log(`Fetching project details data from: ${GEO_POINTS_API_URL}`);
    const apiGeoResponse = await fetchFromCity(GEO_POINTS_API_URL);
    console.log('Data fetched successfully');

    // // 2. Transform geometry point data
    console.log('\nTransforming project details data');
    const geometrics = await transformGeoPointData(apiGeoResponse);
    console.log(`Retrieved ${geometrics.length} geometrics`);

    // 3. Save geometry point data to database
    console.log(`\nSaving to database table: ${GEO_TABLE_NAME}`);
    const savedGeoCount = await saveGeoToDatabase(geometrics, GEO_TABLE_NAME);
    console.log('\nOperation completed successfully!');
    console.log(`Summary: ${savedGeoCount} projects saved to ${GEO_TABLE_NAME} table`);

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

module.exports = { saveToDatabase, saveGeoToDatabase, transformGeoData};

main();

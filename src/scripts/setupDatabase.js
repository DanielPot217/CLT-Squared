const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function setupDatabase() {
  let client;
  try {
    console.log('Setting up database tables...\n');
    
    client = await pool.connect();
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../schema/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    await client.query(schema);
    
    console.log('Tables created successfully!\n');
    
    // Get table information
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Get columns for projects table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    
    console.log('\nProjects table schema:');
    console.log('----------------------------------------');
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      console.log(`  ${col.column_name.padEnd(15)} ${col.data_type.padEnd(20)} ${nullable}`);
    });
    console.log('----------------------------------------');
    
    console.log('\nAll setup complete! Your database is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

setupDatabase();

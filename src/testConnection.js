const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...\n');
    
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Query successful! Current database time:', result.rows[0].now);
    
    // Get database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `);
    
    console.log('\nDatabase Information:');
    console.log('   Database:', dbInfo.rows[0].database);
    console.log('   User:', dbInfo.rows[0].user);
    console.log('   Version:', dbInfo.rows[0].version.substring(0, 50) + '...');
    
    client.release();
    console.log('\nAll tests passed! Your database connection is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\nConnection Error:', error.message);
    process.exit(1);
  }
}

testConnection();
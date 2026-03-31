//Seeds the Database with Sample Projects

// FOR TESTING ONLY

const pool = require('../config/database');

const sampleProjects = [
  {
    name: 'Highway Expansion Project',
    description: 'Expansion of I-40 corridor to reduce traffic congestion',
    location_description: 'WoodSide Avenue',
    start_date: 'Early 2027',
    end_date: 'Late 2027',
    status: 'in-progress',
    budget: '$150,000,000'
  },
  {
    name: 'Bridge Rehabilitation Initiative',
    description: 'Structural assessment and rehabilitation of aging bridges',
    location_description: 'Miller Place',
    start_date: 'Early 2025',
    end_date: 'Late 2027',
    status: 'planning',
    budget: '$75,000,000'
  },
  {
    name: 'Smart Traffic System Implementation',
    description: 'Installation of intelligent traffic management systems across major intersections',
    location_description: 'Saint Drive',
    start_date: 'Early 2026',
    end_date: 'Early 2027',
    status: 'archive',
    budget: '$45,000,000'
  },
  //Default Attributes Test
  {
    name: 'Additional Lane Expantionm'
  }
];

async function seedDatabase() {
  let client;
  try {
    console.log('Seeding database with sample projects...\n');
    
    client = await pool.connect();
    
    for (const project of sampleProjects) {
      // Filter out undefined/null values to let defaults apply
      const columns = [];
      const values = [];
      const placeholders = [];
      let paramIndex = 1;
      
      Object.entries(project).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          columns.push(key);
          values.push(value);
          placeholders.push(`$${paramIndex}`);
          paramIndex++;
        }
      });
      
      const query = `
        INSERT INTO projects (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING project_id;
      `;
      
      const result = await client.query(query, values);
      
      console.log(`Created project: ${project.name} (ID: ${result.rows[0].project_id})`);
    }
    
    // Get all projects
    const allProjects = await client.query('SELECT * FROM projects ORDER BY project_id;');
    
    console.log('\n\nAll projects in database:');
    console.log('========================================');
    allProjects.rows.forEach(proj => {
      console.log(`\nID: ${proj.project_id}`);
      console.log(`Name: ${proj.name}`);
      console.log(`Status: ${proj.status}`);
      console.log(`Duration: ${proj.start_date} to ${proj.end_date}`);
      console.log(`Budget: ${proj.budget}`);
    });
    
    console.log('\n========================================');
    console.log(`Total projects seeded: ${allProjects.rows.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

seedDatabase();

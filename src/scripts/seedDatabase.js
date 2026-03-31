//Seeds the Database with Sample Projects

const pool = require('../config/database');

const sampleProjects = [
  {
    name: 'Highway Expansion Project',
    description: 'Expansion of I-40 corridor to reduce traffic congestion',
    start_date: '2025-01-15',
    end_date: '2027-06-30',
    status: 'in-progress',
    budget: 150000000
  },
  {
    name: 'Bridge Rehabilitation Initiative',
    description: 'Structural assessment and rehabilitation of aging bridges',
    start_date: '2025-03-01',
    end_date: '2026-12-31',
    status: 'planning',
    budget: 75000000
  },
  {
    name: 'Smart Traffic System Implementation',
    description: 'Installation of intelligent traffic management systems across major intersections',
    start_date: '2026-02-01',
    end_date: '2027-03-31',
    status: 'planning',
    budget: 45000000
  }
];

async function seedDatabase() {
  let client;
  try {
    console.log('Seeding database with sample projects...\n');
    
    client = await pool.connect();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await client.query('TRUNCATE TABLE projects RESTART IDENTITY;');
    
    for (const project of sampleProjects) {
      const query = `
        INSERT INTO projects (name, description, start_date, end_date, status, budget)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING project_id;
      `;
      
      const result = await client.query(query, [
        project.name,
        project.description,
        project.start_date,
        project.end_date,
        project.status,
        project.budget
      ]);
      
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
      console.log(`Budget: $${parseFloat(proj.budget).toLocaleString('en-US')}`);
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

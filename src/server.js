// Main API Endpoints

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');
const { swaggerUi, swaggerSpec } = require('./swaggerDocs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// API Documentation - Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
});


// Database health check endpoint
app.get('/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'connected',
      database: process.env.DB_NAME,
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});


// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    
    const validSortFields = ['project_id'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'project_id';
    
    const order = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderByClause = `${sortField} ${order}`;
    
    const result = await pool.query(`SELECT * FROM projects ORDER BY ${orderByClause}`);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get all projects short
app.get('/api/projects-short', async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    
    const validSortFields = ['project_id'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'project_id';
    
    const order = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderByClause = `${sortField} ${order}`;
    const rows = 'project_id, name, description, location_description, status';
    
    const result = await pool.query(`SELECT ${rows} FROM projects ORDER BY ${orderByClause}`);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE project_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get project by ID short
app.get('/api/projects-short/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = 'project_id, name, description, location_description, status';
    const result = await pool.query(`SELECT ${rows} FROM projects WHERE project_id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get all geometrics
app.get('/api/geometrics', async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    
    const validSortFields = ['project_id', 'id'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'id';
    
    const order = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderByClause = `${sortField} ${order}`;
    
    const result = await pool.query(`SELECT * FROM geometrics ORDER BY ${orderByClause}`);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      geometrics: result.rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  if (process.env.NODE_ENV == 'development')
  {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Check nodejs server health http://localhost:${PORT}/health`);
    console.log(`Check database health at http://localhost:${PORT}/db-health`);
    console.log(`Get all projects at http://localhost:${PORT}/api/projects`);
    console.log(`Get all projects short at http://localhost:${PORT}/api/projects-short`);
    console.log(`Get project by ID at http://localhost:${PORT}/api/projects/:id`);
    console.log(`Get project short by ID at http://localhost:${PORT}/api/projects-short/:id`);
    console.log(`Get all geometrics at http://localhost:${PORT}/api/geometrics`);
    console.log(`Swagger Documentation at http://localhost:${PORT}/api-docs`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\nSIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CLT Squared Backend API',
      version: '1.0.0',
      description: 'API documentation for CLT Squared Backend Endpoints'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/swaggerDocs.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Retrieve all projects
 *     description: Fetches details for all projects from the database with optional sorting capabilities. Supports sorting by project_id in ascending or descending order.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [project_id]
 *         description: Field to sort results by. Defaults to 'project_id'
 *         example: project_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order direction. Defaults to 'ASC' (ascending)
 *         example: DESC
 *     responses:
 *       200:
 *         description: Successfully retrieved all projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Number of projects returned
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Project object with all properties from the database
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/projects-short:
 *   get:
 *     summary: Retrieve all projects in short form
 *     description: Fetches details for all projects but only these specific details - project_id, name, description, location_description, status. Retrieves from the database with optional sorting capabilities. Supports sorting by project_id in ascending or descending order.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [project_id]
 *         description: Field to sort results by. Defaults to 'project_id'
 *         example: project_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order direction. Defaults to 'ASC' (ascending)
 *         example: DESC
 *     responses:
 *       200:
 *         description: Successfully retrieved all projects with minimal details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Number of projects returned
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Project object with all short properties from the database
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Retrieve a project by ID
 *     description: Fetches details for a specific project from the database using its project ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the project to retrieve
 *         example: "1"
 *     responses:
 *       200:
 *         description: Successfully retrieved the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 project:
 *                   type: object
 *                   description: The project object with all properties from the database
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/projects-short/{id}:
 *   get:
 *     summary: Retrieve short details about a project by ID
 *     description: Fetches details for a specific project from the database using its project ID, but only displaying these details - project_id, name, description, location_description, status.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the project to retrieve
 *         example: "1"
 *     responses:
 *       200:
 *         description: Successfully retrieved the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 project:
 *                   type: object
 *                   description: The project object with partial properties from the database
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/geometrics:
 *   get:
 *     summary: Retrieve all geometric data
 *     description: Fetches all geometric/spatial data from the geometrics table with optional sorting capabilities. Supports sorting by project_id or id in ascending or descending order.
 *     tags:
 *       - Geometrics
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [project_id, id]
 *         description: Field to sort results by. Defaults to 'id'
 *         example: project_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order direction. Defaults to 'ASC' (ascending)
 *         example: ASC
 *     responses:
 *       200:
 *         description: Successfully retrieved all geometric data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Number of geometric records returned
 *                 geometrics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier
 *                       project_id:
 *                         type: string
 *                         description: Project identifier
 *                       features:
 *                         type: string
 *                         description: GeoJSON geometry data
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Record creation timestamp
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

module.exports = {
  swaggerUi,
  swaggerSpec
};

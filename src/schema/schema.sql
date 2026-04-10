-- THIS WILL DELETE THE PREVIOUS TABLE COMPLETELY IF IT EXISTS
DROP TABLE IF EXISTS geometrics;

-- THIS WILL DELETE THE PREVIOUS TABLE COMPLETELY IF IT EXISTS
DROP TABLE IF EXISTS projects;



-- Projects Table - Infrastructure Project Details
CREATE TABLE IF NOT EXISTS projects (
  project_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR DEFAULT 'not provided',
  location_description VARCHAR DEFAULT 'not provided',
  start_date VARCHAR(255) DEFAULT 'not provided',
  end_date VARCHAR(255) DEFAULT 'not provided',
  status VARCHAR(50) DEFAULT 'not provided',
  budget VARCHAR(255) DEFAULT 'not provided',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Geometry Table - Infrastructure Project Geometry Details
CREATE TABLE IF NOT EXISTS geometrics (
  id SERIAL PRIMARY KEY NOT NULL,
  project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
  features JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
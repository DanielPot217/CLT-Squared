-- Projects Table - Infrastructure Project Details

-- THIS WILL DELETE THE PREVIOUS TABLE COMPLETELY IF IT EXISTS
DROP TABLE IF EXISTS projects;

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

-- Create index on project status for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
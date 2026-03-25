-- Projects Table - Infrastructure Project Details

-- THIS WILL DELETE THE PREVIOUS TABLE COMPLETELY
DROP TABLE projects;

CREATE TABLE IF NOT EXISTS projects (
  project_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  start_date VARCHAR(255),
  end_date VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ongoing',
  budget INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on project status for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
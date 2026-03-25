# Database Setup & API Documentation

## Overview

This document provides step-by-step instructions for setting up your database tables and seeding sample data.

## Quick Start

### 1. Create Database Tables

Run the setup script to create all database tables:

```bash
npm run setup-db
```

**What it does:**
- Reads the SQL schema from `src/schema/schema.sql`
- Creates the `projects` table with all required fields
- Sets up indexes for performance
- Creates automatic triggers for timestamp management

**Expected output:**
```
Setting up database tables...

Tables created successfully!

Tables in database:
  - projects

Projects table schema:
----------------------------------------
project_id        SERIAL            (required)
name              VARCHAR(255)      (required)
description       TEXT              (nullable)
start_date        DATE              (nullable)
end_date          DATE              (nullable)
status            VARCHAR(50)       (nullable)
budget            DECIMAL(15,2)     (nullable)
location          VARCHAR(255)      (nullable)
created_at        TIMESTAMP         (required)
updated_at        TIMESTAMP         (required)
----------------------------------------

All setup complete! Your database is ready to use.
```

### 2. (Optional) Seed Sample Data

Populate the database with sample infrastructure projects:

```bash
npm run seed-db
```

**What it does:**
- Inserts 3 sample infrastructure projects
- Displays all created projects with details

**Sample data included:**
- Highway Expansion Project (in-progress)
- Bridge Rehabilitation Initiative (planning)
- Smart Traffic System Implementation (planning)

## Database Schema

### Projects Table

**Table Name:** `projects`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `project_id` | SERIAL | PRIMARY KEY | Unique project identifier (auto-generated) |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `description` | TEXT | Nullable | Detailed project description |
| `start_date` | DATE | Nullable | Project start date |
| `end_date` | DATE | Nullable | Project end date |
| `status` | VARCHAR(50) | Default: 'planning' | Project status (planning, in-progress, completed, on-hold) |
| `budget` | DECIMAL(15,2) | Nullable | Project budget in dollars |
| `location` | VARCHAR(255) | Nullable | Geographic location |
| `created_at` | TIMESTAMP | Auto | Record creation timestamp |
| `updated_at` | TIMESTAMP | Auto | Record update timestamp |

**Indexes:**
- `idx_projects_status` - Speed up filtering by status
- `idx_projects_start_date` - Speed up date-range queries

**Automatic Features:**
- `updated_at` is automatically set to current timestamp on INSERT
- `updated_at` is automatically updated on every UPDATE


**Valid Status Values:**
- `planning` - Project in planning phase
- `in-progress` - Project actively running
- `completed` - Project finished
- `on-hold` - Project temporarily paused

## File Structure

```
src/
├── config/
│   └── database.js           # Database connection pool
├── routes/
│   └── projects.js           # Projects API routes
├── schema/
│   └── schema.sql            # Database table definitions
├── scripts/
│   ├── setupDatabase.js      # Create tables
│   └── seedDatabase.js       # Insert sample data
├── server.js                 # Express server
└── testConnection.js         # Test database connection
```

## Common Tasks

### Clear All Projects
```bash
node -e "
const pool = require('./src/config/database');
pool.query('TRUNCATE TABLE projects RESTART IDENTITY;')
  .then(() => { console.log('Cleared!'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
"
```

### Export Projects to CSV
```sql
\COPY (SELECT * FROM projects) TO STDOUT WITH CSV HEADER;
```

### Backup Database
```bash
pg_dump -h localhost -U postgres clt_squared > backup.sql
```

### Restore Database
```bash
psql -h localhost -U postgres clt_squared < backup.sql
```

## Extending the Schema

To add new fields or tables:

1. Edit `src/schema/schema.sql`
2. Run `npm run setup-db` (this is safe - uses IF NOT EXISTS clauses)
3. For existing production data, use SQL ALTER TABLE commands instead

Example:
```sql
ALTER TABLE projects ADD COLUMN contractor VARCHAR(255);
ALTER TABLE projects ADD COLUMN phase_number INT DEFAULT 1;
```

## Error Handling

### Connection Issues
- Verify PostgreSQL is running
- Check `.env` file configuration
- Ensure database `clt_squared` exists

### Permission Errors
- Verify user has privileges: `GRANT ALL PRIVILEGES ON DATABASE clt_squared TO your_user;`

### Table Already Exists
- This is normal! The schema uses `IF NOT EXISTS`
- Safe to run setup multiple times

## Performance Considerations

- Queries are indexed on `status` and `start_date` for fast filtering
- Connection pooling is configured in `database.js`
- `updated_at` is managed automatically via triggers
- Consider adding pagination for large result sets
# CLT Squared Backend

Node.js backend API with PostgreSQL database connection.

## Project Structure

```
src/
├── config/
│   └── database.js       # PostgreSQL connection pool
├── server.js             # Express server setup
└── testConnection.js     # Database connection test
.env.example              # Environment variables template
package.json              # Project dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- **express** - Web framework
- **pg** - PostgreSQL client
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Auto-reload during development

### 2. Create PostgreSQL Database

Open PostgreSQL terminal (psql) and create the database:

```sql
CREATE DATABASE clt_squared;
```

Optional: Create a dedicated user (recommended for production):

```sql
CREATE USER clt_user WITH PASSWORD 'your_secure_password';
ALTER ROLE clt_user SET client_encoding TO 'utf8';
ALTER ROLE clt_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE clt_user SET default_transaction_deferrable TO on;
ALTER ROLE clt_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE clt_squared TO clt_user;
```

### 3. Configure Environment Variables

Copy the example file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL settings:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=clt_squared
PORT=3000
NODE_ENV=development
```

### 4. Test Database Connection

Run the connection test to verify everything is configured correctly:

```bash
npm run test-db
```

Expected output:
```
🔍 Testing PostgreSQL connection...
✅ Successfully connected to PostgreSQL!
✅ Query successful! Current database time: [timestamp]
📊 Database Information:
   Database: clt_squared
   User: postgres
   Version: PostgreSQL ...
✅ All tests passed! Your database connection is working correctly.
```

### 5. Start the Server

**Production mode:**
```bash
npm start
```

**Development mode (with auto-reload):**
```bash
npm run dev
```

Server will be running at `http://localhost:3000`

## Available Endpoints

### Health Checks

- **GET** `/health` - Server health check
  ```json
  {
    "status": "OK",
    "message": "Server is running",
    "timestamp": "2026-03-24T..."
  }
  ```

- **GET** `/db-health` - Database connection health check
  ```json
  {
    "status": "connected",
    "database": "clt_squared",
    "timestamp": "2026-03-24T..."
  }
  ```

### Database Information

- **GET** `/api/tables` - List all database tables
  ```json
  {
    "tables": ["users", "products", ...],
    "count": 2
  }
  ```

## Database Connection Details

The connection is managed through a connection pool in `src/config/database.js`. The pool:
- Reuses connections for better performance
- Automatically handles connection lifecycle
- Provides error handling and event listeners
- Reads credentials from environment variables

### Connection Pool Events

The pool logs the following events:
- ✓ New client connected
- ✓ Client removed from pool
- ✗ Unexpected errors on idle clients

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL service is running
- Check if PostgreSQL is listening on the configured port (default: 5432)
- On Windows: Check Services or use `pg_ctl`
- On macOS: Use Homebrew services: `brew services start postgresql@14`

### Authentication Failed
- Verify DB_USER and DB_PASSWORD in `.env`
- Check PostgreSQL user credentials
- Ensure the user has permission to access the database

### Database Does Not Exist
- Run: `CREATE DATABASE clt_squared;` in psql
- Verify DB_NAME in `.env` matches

### Permission Denied
- Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE clt_squared TO your_user;`
- For new installations, use default postgres user

## Development Tips

1. **Use .env for local development** - Never commit `.env` to git
2. **Check `.gitignore`** - Make sure node_modules and .env are ignored
3. **Monitor connections** - Watch console logs for connection pool status
4. **Test queries** - Use the testConnection.js script frequently
5. **Error handling** - All routes include error handling

## Next Steps

1. ✅ Database is connected and tested
2. Define your data models (create tables)
3. Build API routes for your features
4. Add authentication/authorization
5. Implement business logic
6. Add data validation
7. Deploy to production

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg npm Documentation](https://node-postgres.com/)
- [Express.js Guide](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)

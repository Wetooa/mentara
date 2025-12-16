# Database Exports

This directory contains database exports from the Supabase PostgreSQL database.

## Directory Structure

```
database/
├── exports/              # Timestamped export directories (gitignored)
│   └── export_YYYYMMDD_HHMMSS/
│       ├── sql/          # SQL dump files
│       ├── csv/          # CSV files per table
│       └── export_summary.txt
└── README.md            # This file
```

## Exporting the Database

### Prerequisites

1. **PostgreSQL Client Tools**
   - Install `pg_dump` and `psql`
   - Ubuntu/Debian: `sudo apt-get install postgresql-client`
   - macOS: `brew install postgresql`
   - Windows: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/)

2. **Database Connection String**
   - Ensure `DATABASE_URL` or `DIRECT_URL` is set in `mentara-api/.env`
   - For Supabase, use the direct connection URL (not pooler):
     ```
     DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
     ```
   - Or set as environment variable before running the script

### Running the Export

From the project root:

```bash
./scripts/export-database.sh
```

The script will:
1. Load database connection from `mentara-api/.env`
2. Test the connection
3. Create a timestamped export directory
4. Export SQL dump to `sql/` subdirectory
5. Export each table as CSV to `csv/` subdirectory
6. Generate an export summary

### Export Output

Each export creates a directory with:
- **SQL Dump**: Complete database schema and data in SQL format
- **CSV Files**: One CSV file per table with headers
- **Summary**: Export metadata and instructions

Example:
```
database/exports/export_20250115_143022/
├── sql/
│   └── mentara_database_20250115_143022.sql
├── csv/
│   ├── User.csv
│   ├── Therapist.csv
│   ├── Client.csv
│   └── ... (all other tables)
└── export_summary.txt
```

## Restoring from Export

### From SQL Dump

To restore the entire database:

```bash
psql $DATABASE_URL < database/exports/export_YYYYMMDD_HHMMSS/sql/mentara_database_YYYYMMDD_HHMMSS.sql
```

**Note**: If you encounter foreign key constraint errors during restore (due to circular references), use:

```bash
# Temporarily disable triggers during restore
psql $DATABASE_URL -c "SET session_replication_role = 'replica';" && \
psql $DATABASE_URL < database/exports/export_YYYYMMDD_HHMMSS/sql/mentara_database_YYYYMMDD_HHMMSS.sql && \
psql $DATABASE_URL -c "SET session_replication_role = 'origin';"
```

This temporarily disables foreign key checks during the restore process.

### From CSV Files

To import a specific table:

```bash
psql $DATABASE_URL -c "\COPY \"TableName\" FROM 'database/exports/export_YYYYMMDD_HHMMSS/csv/TableName.csv' WITH (FORMAT CSV, HEADER, DELIMITER ',');"
```

**Note**: CSV imports require the table to already exist. Use the SQL dump for full restoration.

## For Software Engineering Project

This database export is required for the software engineering project submission. It provides:

1. **Complete Database Schema**: SQL dump contains all table definitions, indexes, and constraints
2. **Sample Data**: All data from the Supabase database at the time of export
3. **Portable Format**: Can be imported into any PostgreSQL database
4. **Analysis Ready**: CSV files can be used for data analysis in Excel, Python, etc.

## Security Notes

- Database exports contain sensitive user data
- Exports are gitignored and should not be committed to version control
- Store exports securely and delete when no longer needed
- For production databases, ensure proper access controls

## Troubleshooting

### Connection Errors

If you get connection errors:
1. Verify `DATABASE_URL` in `mentara-api/.env`
2. Ensure you're using the **direct connection** URL (port 5432), not the pooler (port 6543)
3. Check that your IP is whitelisted in Supabase (if required)
4. Verify database credentials are correct

### Missing PostgreSQL Tools

If `pg_dump` or `psql` are not found:
- Install PostgreSQL client tools (see Prerequisites above)
- Ensure they're in your PATH

### Permission Errors

If you get permission errors:
- Ensure the script is executable: `chmod +x scripts/export-database.sh`
- Check that you have write permissions in the `database/exports/` directory


# Arbeit Backend - MySQL Setup Guide

## Overview
This backend application has been successfully migrated from MongoDB to MySQL. All services now use JPA (Java Persistence API) with Hibernate for database operations.

## Prerequisites
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Database Setup

### 1. Create MySQL Database
```sql
CREATE DATABASE arbeit;
```

### 2. Update Database Credentials (Optional)
If you want to use different database credentials, update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/arbeit
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Run the Application
The application will automatically create all necessary tables when it starts:
```bash
mvn spring-boot:run
```

### 4. Load Sample Data
After the application starts and creates the tables, run the sample data script:
```bash
mysql -u root -p arbeit < sample_data.sql
```

## Database Schema

### Tables Created
- `users` - User accounts and profiles
- `companies` - Business/company information
- `jobs` - Job postings
- `applications` - Job applications

### Key Changes from MongoDB
- **ID Fields**: Changed from `String` to `Long` with auto-generation
- **Relationships**: Now use JPA annotations instead of MongoDB references
- **File Storage**: Changed from GridFS to local file system storage
- **Queries**: Converted from MongoDB queries to JPA methods

## Sample Data Overview

### Companies (3 records)
- TechCorp Solutions (ID: B001)
- InnovateTech (ID: B002)
- StartupCo (ID: B003)

### Users (5 records)
- Alice Johnson (Senior Java Developer)
- Bob Smith (Product Manager)
- Carol Williams (UX Designer)
- David Brown (Data Analyst)
- Eve Davis (DevOps Engineer)

### Jobs (5 records)
- Senior Java Developer at TechCorp Solutions
- Product Manager at InnovateTech
- UX Designer at StartupCo
- Data Analyst at TechCorp Solutions
- DevOps Engineer at InnovateTech

### Applications (6 records)
Various applications with different statuses (Pending, Under Review, Shortlisted, Accepted, Rejected)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/business/auth/register` - Business registration
- `POST /api/business/auth/login` - Business login

### Jobs
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/{jobId}` - Get job by ID
- `POST /api/jobs` - Create new job (business only)
- `GET /api/jobs/company/{companyEmail}` - Get company's jobs

### Applications
- `POST /api/applications` - Submit job application
- `GET /api/applications` - Get all applications (admin)
- `GET /api/applications/job/{jobId}` - Get applications for a job
- `GET /api/applications/user/{userId}` - Get user's applications
- `PUT /api/applications` - Update application status

### File Upload
- Resume files are stored in `uploads/resumes/` directory
- File naming convention: `{userId}_resume.pdf`

## Configuration

### File Upload Directory
The application creates the upload directory automatically:
```
uploads/
  └── resumes/
      ├── 123_resume.pdf
      ├── 456_resume.pdf
      └── ...
```

### JPA Configuration
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## Testing the Application

### 1. Start the Application
```bash
mvn spring-boot:run
```

### 2. Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Jobs API
```bash
# Get all active jobs
curl http://localhost:8080/api/jobs

# Get specific job
curl http://localhost:8080/api/jobs/J000001
```

### 4. Test Applications API
```bash
# Get all applications
curl http://localhost:8080/api/applications

# Submit application (with authentication)
curl -X POST http://localhost:8080/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobId": "J000001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "coverLetter": "I am interested in this position..."
  }'
```

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Ensure MySQL is running and credentials are correct
2. **Table Creation Failed**: Check MySQL user permissions
3. **File Upload Failed**: Ensure the application has write permissions to the uploads directory

### Logs
Check application logs for detailed error messages:
```bash
tail -f logs/spring.log
```

## Migration Notes

### From MongoDB to MySQL
- **Document IDs**: MongoDB ObjectIds converted to auto-increment Long IDs
- **GridFS**: File storage changed from GridFS to local file system
- **Queries**: MongoDB aggregation queries converted to JPA Criteria API or JPQL
- **Relationships**: MongoDB references replaced with JPA entity relationships

### Data Types Changes
- `_id` (String) → `id` (Long)
- `ObjectId` references → Foreign key relationships
- `Date` → `LocalDateTime`

This migration maintains all functionality while providing better relational data integrity and SQL query capabilities.

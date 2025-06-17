# Islamic Grave Assignment System

A comprehensive Node.js/Express API for managing Islamic cemetery grave assignments, deceased person records, and cemetery sections.

## 🏛️ Features

- **Cemetery Section Management**: Create and manage cemetery sections with capacity tracking
- **Grave Management**: Track individual graves with status (available, occupied, maintenance)
- **Deceased Person Records**: Maintain detailed records of deceased persons with Arabic/English names
- **Grave Assignments**: Assign graves to deceased persons with burial scheduling
- **Statistics & Reporting**: Comprehensive cemetery statistics and occupancy reports
- **RESTful API**: Full CRUD operations with proper validation and error handling
- **Database Integration**: MySQL database with proper relationships and constraints

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher) or MAMP
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd islamic-grave-assignment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=8889
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=islamic_grave_system
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Import the SQL schema
   mysql -u root -p islamic_grave_system < database/schema.sql
   
   # Or use the setup script
   ./setup-test-db.sh
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Cemetery Sections
- `GET /api/sections` - Get all cemetery sections
- `POST /api/sections` - Create new cemetery section
- `GET /api/sections/:sectionId` - Get specific section

### Graves
- `GET /api/graves` - Get all graves (with optional filtering)
- `POST /api/graves` - Create new grave
- `GET /api/graves/:graveId` - Get specific grave
- `GET /api/graves/available/:sectionId` - Get available graves by section

### Deceased Persons
- `GET /api/deceased` - Get all deceased persons (with optional search)
- `POST /api/deceased` - Create new deceased person record
- `GET /api/deceased/:id` - Get specific deceased person

### Grave Assignments
- `GET /api/assignments` - Get all grave assignments
- `POST /api/assignments` - Create new grave assignment
- `GET /api/assignments/:id` - Get specific assignment
- `PATCH /api/assignments/:id/complete` - Mark burial as completed

### Statistics
- `GET /api/statistics` - Get cemetery statistics

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
npm run test:unit
npm run test:integration
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Debug tests
```bash
npm run test:debug
```

## 🛠️ Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run debug` - Start server with Node.js debugger
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### API Testing

Use the provided curl commands for testing:

```bash
# Run the complete test script
./test-api.sh

# Or use individual commands from curl-examples.md
```

## 📊 Database Schema

The system uses a MySQL database with the following main tables:

- **cemetery_sections**: Cemetery section information
- **graves**: Individual grave records
- **deceased_persons**: Deceased person information
- **grave_assignments**: Grave assignment records

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `8889` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `` |
| `DB_NAME` | Database name | `islamic_grave_system` |
| `PORT` | API port | `3000` |
| `NODE_ENV` | Environment | `development` |

## 📝 API Documentation

### Request/Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": [...],
  "message": "Operation successful"
}
```

### Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

### Pagination (Removed)

Pagination has been removed from the API for simplicity. All endpoints return complete datasets.

## 🔒 Security Features

- Input validation using express-validator
- SQL injection prevention with parameterized queries
- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- CORS enabled

## 🏗️ Project Structure

```
islamic-grave-assignment-system/
├── database/
│   ├── schema.sql
│   └── sample-data.sql
├── tests/
│   ├── integration/
│   └── unit/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── test-api.sh
└── curl-examples.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test examples

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete CRUD operations for all entities
- Comprehensive API testing
- Database schema with proper relationships
- Security and validation features 
# Islamic Grave Assignment API - Curl Test Commands

## Prerequisites
- Make sure the server is running on port 3000
- Make sure the database is properly set up with test data

## Health Check
```bash
curl -X GET "http://localhost:3000/api/health" \
  -H "Content-Type: application/json"
```

## Cemetery Sections

### Get All Sections
```bash
curl -X GET "http://localhost:3000/api/sections" \
  -H "Content-Type: application/json"
```

### Create New Section
```bash
curl -X POST "http://localhost:3000/api/sections" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "SECTION-A",
    "section_name": "Section A",
    "total_plots": 100,
    "available_plots": 100,
    "description": "Test section"
  }'
```

### Get Specific Section
```bash
curl -X GET "http://localhost:3000/api/sections/SECTION-A" \
  -H "Content-Type: application/json"
```

## Graves

### Get All Graves (with pagination)
```bash
curl -X GET "http://localhost:3000/api/graves?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get Graves by Section
```bash
curl -X GET "http://localhost:3000/api/graves?section=SECTION-A" \
  -H "Content-Type: application/json"
```

### Get Graves by Status
```bash
curl -X GET "http://localhost:3000/api/graves?status=available" \
  -H "Content-Type: application/json"
```

### Create New Grave
```bash
curl -X POST "http://localhost:3000/api/graves" \
  -H "Content-Type: application/json" \
  -d '{
    "grave_id": "GRAVE-001",
    "section": "SECTION-A",
    "grave_row": 1,
    "grave_plot": 1,
    "status": "available"
  }'
```

### Get Available Graves by Section
```bash
curl -X GET "http://localhost:3000/api/graves/available/SECTION-A" \
  -H "Content-Type: application/json"
```

### Get Specific Grave
```bash
curl -X GET "http://localhost:3000/api/graves/GRAVE-001" \
  -H "Content-Type: application/json"
```

## Deceased Persons

### Get All Deceased Persons
```bash
curl -X GET "http://localhost:3000/api/deceased?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Search Deceased Persons
```bash
curl -X GET "http://localhost:3000/api/deceased?search=Ahmed" \
  -H "Content-Type: application/json"
```

### Create Deceased Person
```bash
curl -X POST "http://localhost:3000/api/deceased" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name_arabic": "أحمد محمد علي",
    "full_name_english": "Ahmed Mohammed Ali",
    "eid": "123456789012345",
    "age_at_death": 75,
    "gender": "male",
    "date_of_death": "2024-01-15",
    "date_of_burial": "2024-01-16",
    "nationality": "UAE",
    "special_requests": "Test burial request"
  }'
```

### Get Specific Deceased Person
```bash
curl -X GET "http://localhost:3000/api/deceased/1" \
  -H "Content-Type: application/json"
```

## Grave Assignments

### Get All Assignments
```bash
curl -X GET "http://localhost:3000/api/assignments?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Create Grave Assignment
```bash
curl -X POST "http://localhost:3000/api/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "deceased_id": 1,
    "grave_id": "GRAVE-001",
    "assigned_by": "admin",
    "burial_date": "2024-01-16",
    "burial_time": "14:30:00",
    "notes": "Test assignment"
  }'
```

### Get Specific Assignment
```bash
curl -X GET "http://localhost:3000/api/assignments/1" \
  -H "Content-Type: application/json"
```

### Mark Burial as Completed
```bash
curl -X PATCH "http://localhost:3000/api/assignments/1/complete" \
  -H "Content-Type: application/json"
```

## Statistics

### Get Cemetery Statistics
```bash
curl -X GET "http://localhost:3000/api/statistics" \
  -H "Content-Type: application/json"
```

## Error Testing

### Test Invalid Endpoint (404)
```bash
curl -X GET "http://localhost:3000/api/invalid" \
  -H "Content-Type: application/json"
```

### Test Validation Error
```bash
curl -X POST "http://localhost:3000/api/graves" \
  -H "Content-Type: application/json" \
  -d '{
    "grave_id": "",
    "section": "",
    "grave_row": 0,
    "grave_plot": -1
  }'
```

### Test Non-existent Grave Assignment
```bash
curl -X POST "http://localhost:3000/api/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "deceased_id": 1,
    "grave_id": "NON-EXISTENT",
    "assigned_by": "admin",
    "burial_date": "2024-01-16",
    "burial_time": "14:30:00"
  }'
```

## Quick Test Sequence

Here's a quick test sequence to verify the API:

1. **Health Check**
```bash
curl -X GET "http://localhost:3000/api/health"
```

2. **Create Section**
```bash
curl -X POST "http://localhost:3000/api/sections" \
  -H "Content-Type: application/json" \
  -d '{"section_id": "TEST", "section_name": "Test", "total_plots": 10, "available_plots": 10}'
```

3. **Create Grave**
```bash
curl -X POST "http://localhost:3000/api/graves" \
  -H "Content-Type: application/json" \
  -d '{"grave_id": "TEST-01", "section": "TEST", "grave_row": 1, "grave_plot": 1}'
```

4. **Create Deceased Person**
```bash
curl -X POST "http://localhost:3000/api/deceased" \
  -H "Content-Type: application/json" \
  -d '{"full_name_arabic": "Test", "eid": "123", "age_at_death": 70, "gender": "male", "date_of_death": "2024-01-15"}'
```

5. **Create Assignment**
```bash
curl -X POST "http://localhost:3000/api/assignments" \
  -H "Content-Type: application/json" \
  -d '{"deceased_id": 1, "grave_id": "TEST-01", "assigned_by": "admin", "burial_date": "2024-01-16", "burial_time": "14:30:00"}'
```

6. **Get Statistics**
```bash
curl -X GET "http://localhost:3000/api/statistics"
``` 
#!/bin/bash

# Islamic Grave Assignment API Test Script
# Make sure the server is running on port 3000 before executing these tests

BASE_URL="http://localhost:3000/api"
echo "Testing Islamic Grave Assignment API"
echo "=================================="

# Health Check
echo -e "\n1. Health Check:"
curl -X GET "$BASE_URL/health" -H "Content-Type: application/json"

# Cemetery Sections
echo -e "\n\n2. Get All Cemetery Sections:"
curl -X GET "$BASE_URL/sections" -H "Content-Type: application/json"

echo -e "\n\n3. Create Cemetery Section:"
curl -X POST "$BASE_URL/sections" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "TEST-SECTION",
    "section_name": "Test Section",
    "total_plots": 100,
    "available_plots": 100,
    "description": "Test section for API testing"
  }'

echo -e "\n\n4. Get Specific Cemetery Section:"
curl -X GET "$BASE_URL/sections/TEST-SECTION" -H "Content-Type: application/json"

# Graves
echo -e "\n\n5. Get All Graves (with pagination):"
curl -X GET "$BASE_URL/graves?page=1&limit=10" -H "Content-Type: application/json"

echo -e "\n\n6. Create New Grave:"
curl -X POST "$BASE_URL/graves" \
  -H "Content-Type: application/json" \
  -d '{
    "grave_id": "TEST-GRAVE-01",
    "section": "TEST-SECTION",
    "grave_row": 1,
    "grave_plot": 1,
    "status": "available"
  }'

echo -e "\n\n7. Get Graves by Section:"
curl -X GET "$BASE_URL/graves?section=TEST-SECTION" -H "Content-Type: application/json"

echo -e "\n\n8. Get Graves by Status:"
curl -X GET "$BASE_URL/graves?status=available" -H "Content-Type: application/json"

echo -e "\n\n9. Get Available Graves by Section:"
curl -X GET "$BASE_URL/graves/available/TEST-SECTION" -H "Content-Type: application/json"

echo -e "\n\n10. Get Specific Grave:"
curl -X GET "$BASE_URL/graves/TEST-GRAVE-01" -H "Content-Type: application/json"

# Deceased Persons
echo -e "\n\n11. Get All Deceased Persons:"
curl -X GET "$BASE_URL/deceased?page=1&limit=10" -H "Content-Type: application/json"

echo -e "\n\n12. Create Deceased Person:"
curl -X POST "$BASE_URL/deceased" \
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

echo -e "\n\n13. Search Deceased Persons:"
curl -X GET "$BASE_URL/deceased?search=Ahmed" -H "Content-Type: application/json"

echo -e "\n\n14. Get Specific Deceased Person:"
curl -X GET "$BASE_URL/deceased/1" -H "Content-Type: application/json"

# Grave Assignments
echo -e "\n\n15. Get All Grave Assignments:"
curl -X GET "$BASE_URL/assignments?page=1&limit=10" -H "Content-Type: application/json"

echo -e "\n\n16. Create Grave Assignment:"
curl -X POST "$BASE_URL/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "deceased_id": 1,
    "grave_id": "TEST-GRAVE-01",
    "assigned_by": "admin",
    "burial_date": "2024-01-16",
    "burial_time": "14:30:00",
    "notes": "Test assignment"
  }'

echo -e "\n\n17. Get Specific Grave Assignment:"
curl -X GET "$BASE_URL/assignments/1" -H "Content-Type: application/json"

echo -e "\n\n18. Mark Burial as Completed:"
curl -X PATCH "$BASE_URL/assignments/1/complete" -H "Content-Type: application/json"

# Statistics
echo -e "\n\n19. Get Cemetery Statistics:"
curl -X GET "$BASE_URL/statistics" -H "Content-Type: application/json"

# Error Tests
echo -e "\n\n20. Test Invalid Endpoint (404):"
curl -X GET "$BASE_URL/invalid" -H "Content-Type: application/json"

echo -e "\n\n21. Test Invalid Grave Assignment (non-existent grave):"
curl -X POST "$BASE_URL/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "deceased_id": 1,
    "grave_id": "NON-EXISTENT",
    "assigned_by": "admin",
    "burial_date": "2024-01-16",
    "burial_time": "14:30:00"
  }'

echo -e "\n\n22. Test Invalid Deceased Person (non-existent):"
curl -X POST "$BASE_URL/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "deceased_id": 999,
    "grave_id": "TEST-GRAVE-01",
    "assigned_by": "admin",
    "burial_date": "2024-01-16",
    "burial_time": "14:30:00"
  }'

echo -e "\n\n23. Test Validation Error (missing required fields):"
curl -X POST "$BASE_URL/graves" \
  -H "Content-Type: application/json" \
  -d '{
    "grave_id": "",
    "section": "",
    "grave_row": 0,
    "grave_plot": -1
  }'

echo -e "\n\nAPI Testing Complete!"
echo "Check the responses above for any errors or issues." 
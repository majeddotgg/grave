const request = require('supertest');
const app = require('../../server');

describe('Grave Assignments Endpoints', () => {
  const testSection = {
    section_id: 'TEST-ASSIGN',
    section_name: 'Test Assignment Section',
    total_plots: 50,
    available_plots: 50,
    description: 'Test section for assignment testing'
  };

  const testGrave = {
    grave_id: 'TEST-ASSIGN-01',
    section: 'TEST-ASSIGN',
    grave_row: 1,
    grave_plot: 1,
    status: 'available'
  };

  const testDeceased = {
    full_name_arabic: 'أحمد محمد علي',
    full_name_english: 'Ahmed Mohammed Ali',
    eid: '123456789012345',
    age_at_death: 75,
    gender: 'male',
    date_of_death: '2024-01-15',
    nationality: 'UAE',
    special_requests: 'Test special requests'
  };

  const testAssignment = {
    deceased_id: 1, // Will be set after creating deceased person
    grave_id: 'TEST-ASSIGN-01',
    assigned_by: 'Test User',
    burial_date: '2024-01-16',
    burial_time: '14:30:00',
    notes: 'Test assignment notes'
  };

  let deceasedId;

  beforeAll(async () => {
    // Create test section
    await request(app)
      .post('/api/sections')
      .send(testSection);

    // Create test grave
    await request(app)
      .post('/api/graves')
      .send(testGrave);

    // Create test deceased person
    const deceasedResponse = await request(app)
      .post('/api/deceased')
      .send(testDeceased);

    deceasedId = deceasedResponse.body.deceased_id;
    testAssignment.deceased_id = deceasedId;
  });

  describe('GET /api/assignments', () => {
    test('should return all assignments with pagination', async () => {
      const response = await request(app)
        .get('/api/assignments?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/assignments', () => {
    test('should create a new grave assignment', async () => {
      const response = await request(app)
        .post('/api/assignments')
        .send(testAssignment)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Grave assignment created successfully');
      expect(response.body).toHaveProperty('assignment_id');
    });

    test('should return 400 for invalid assignment data', async () => {
      const invalidAssignment = {
        deceased_id: -1,
        grave_id: '',
        assigned_by: '',
        burial_date: 'invalid-date',
        burial_time: 'invalid-time'
      };

      const response = await request(app)
        .post('/api/assignments')
        .send(invalidAssignment)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 for non-existent grave', async () => {
      const assignmentWithInvalidGrave = {
        ...testAssignment,
        grave_id: 'NONEXISTENT-GRAVE'
      };

      const response = await request(app)
        .post('/api/assignments')
        .send(assignmentWithInvalidGrave)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Grave not found');
    });

    test('should return 400 for non-existent deceased person', async () => {
      const assignmentWithInvalidDeceased = {
        ...testAssignment,
        deceased_id: 99999
      };

      const response = await request(app)
        .post('/api/assignments')
        .send(assignmentWithInvalidDeceased)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Deceased person not found');
    });

    test('should return 400 for unavailable grave', async () => {
      // First assign the grave
      await request(app)
        .post('/api/assignments')
        .send(testAssignment);

      // Try to assign the same grave again
      const response = await request(app)
        .post('/api/assignments')
        .send(testAssignment)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Grave is not available for assignment');
    });
  });

  describe('GET /api/assignments/:id', () => {
    test('should return a specific assignment', async () => {
      // First create an assignment
      const createResponse = await request(app)
        .post('/api/assignments')
        .send(testAssignment);

      const assignmentId = createResponse.body.assignment_id;

      const response = await request(app)
        .get(`/api/assignments/${assignmentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('assignment_id', assignmentId);
      expect(response.body.data).toHaveProperty('grave_id', testAssignment.grave_id);
      expect(response.body.data).toHaveProperty('deceased_id', testAssignment.deceased_id);
    });

    test('should return 404 for non-existent assignment', async () => {
      const response = await request(app)
        .get('/api/assignments/99999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Grave assignment not found');
    });
  });

  describe('PATCH /api/assignments/:id/complete', () => {
    test('should mark burial as completed', async () => {
      // First create an assignment
      const createResponse = await request(app)
        .post('/api/assignments')
        .send(testAssignment);

      const assignmentId = createResponse.body.assignment_id;

      const response = await request(app)
        .patch(`/api/assignments/${assignmentId}/complete`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Burial marked as completed');
    });

    test('should return 404 for non-existent assignment', async () => {
      const response = await request(app)
        .patch('/api/assignments/99999/complete')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Assignment not found');
    });
  });
}); 
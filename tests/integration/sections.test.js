const request = require('supertest');
const app = require('../../server');

describe('Cemetery Sections Endpoints', () => {
  const testSection = {
    section_id: 'TEST-A',
    section_name: 'Test Section A',
    total_plots: 50,
    available_plots: 50,
    description: 'Test section for integration testing'
  };

  describe('GET /api/sections', () => {
    test('should return all cemetery sections', async () => {
      const response = await request(app)
        .get('/api/sections')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/sections', () => {
    test('should create a new cemetery section', async () => {
      const response = await request(app)
        .post('/api/sections')
        .send(testSection)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Cemetery section created successfully');
    });

    test('should return 400 for invalid data', async () => {
      const invalidSection = {
        section_id: '',
        section_name: '',
        total_plots: -1,
        available_plots: -1
      };

      const response = await request(app)
        .post('/api/sections')
        .send(invalidSection)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return 409 for duplicate section_id', async () => {
      // First create a section
      await request(app)
        .post('/api/sections')
        .send(testSection);

      // Try to create the same section again
      const response = await request(app)
        .post('/api/sections')
        .send(testSection)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Section ID already exists');
    });
  });

  describe('GET /api/sections/:sectionId', () => {
    test('should return a specific cemetery section', async () => {
      // First create a section
      await request(app)
        .post('/api/sections')
        .send(testSection);

      const response = await request(app)
        .get(`/api/sections/${testSection.section_id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('section_id', testSection.section_id);
    });

    test('should return 404 for non-existent section', async () => {
      const response = await request(app)
        .get('/api/sections/NONEXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Cemetery section not found');
    });
  });
}); 
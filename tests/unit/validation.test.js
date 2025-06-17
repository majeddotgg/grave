const { body, validationResult } = require('express-validator');

describe('Validation Middleware', () => {
  describe('Cemetery Section Validation', () => {
    test('should validate required fields', async () => {
      const validations = [
        body('section_id').notEmpty().withMessage('Section ID is required'),
        body('section_name').notEmpty().withMessage('Section name is required'),
        body('total_plots').isInt({ min: 0 }).withMessage('Total plots must be a positive integer'),
        body('available_plots').isInt({ min: 0 }).withMessage('Available plots must be a positive integer')
      ];

      // Test valid data
      const validData = {
        section_id: 'TEST',
        section_name: 'Test Section',
        total_plots: 100,
        available_plots: 50
      };

      const mockReq = { body: validData };
      
      for (const validation of validations) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    test('should fail validation for missing required fields', async () => {
      const validations = [
        body('section_id').notEmpty().withMessage('Section ID is required'),
        body('section_name').notEmpty().withMessage('Section name is required'),
        body('total_plots').isInt({ min: 0 }).withMessage('Total plots must be a positive integer'),
        body('available_plots').isInt({ min: 0 }).withMessage('Available plots must be a positive integer')
      ];

      const invalidData = {
        section_id: '',
        section_name: '',
        total_plots: -1,
        available_plots: -1
      };

      const mockReq = { body: invalidData };
      
      for (const validation of validations) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toHaveLength(4);
    });
  });

  describe('Grave Validation', () => {
    test('should validate grave creation data', async () => {
      const validations = [
        body('grave_id').notEmpty().withMessage('Grave ID is required'),
        body('section').notEmpty().withMessage('Section is required'),
        body('grave_row').isInt({ min: 1 }).withMessage('Grave row must be a positive integer'),
        body('grave_plot').isInt({ min: 1 }).withMessage('Grave plot must be a positive integer'),
        body('status').optional().isIn(['available', 'occupied', 'maintenance']).withMessage('Invalid status')
      ];

      const validData = {
        grave_id: 'TEST-01',
        section: 'TEST',
        grave_row: 1,
        grave_plot: 1,
        status: 'available'
      };

      const mockReq = { body: validData };
      
      for (const validation of validations) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    test('should fail validation for invalid grave data', async () => {
      const validations = [
        body('grave_id').notEmpty().withMessage('Grave ID is required'),
        body('section').notEmpty().withMessage('Section is required'),
        body('grave_row').isInt({ min: 1 }).withMessage('Grave row must be a positive integer'),
        body('grave_plot').isInt({ min: 1 }).withMessage('Grave plot must be a positive integer'),
        body('status').optional().isIn(['available', 'occupied', 'maintenance']).withMessage('Invalid status')
      ];

      const invalidData = {
        grave_id: '',
        section: '',
        grave_row: 0,
        grave_plot: -1,
        status: 'invalid_status'
      };

      const mockReq = { body: invalidData };
      
      for (const validation of validations) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().length).toBeGreaterThan(0);
    });
  });

  describe('Deceased Person Validation', () => {
    test('should validate deceased person data', async () => {
      const validations = [
        body('full_name_arabic').notEmpty().withMessage('Arabic name is required'),
        body('full_name_english').optional(),
        body('eid').notEmpty().withMessage('Emirates ID is required'),
        body('age_at_death').isInt({ min: 0 }).withMessage('Age at death must be a positive integer'),
        body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
        body('date_of_death').isDate().withMessage('Valid date of death is required'),
        body('date_of_burial').optional().isDate().withMessage('Invalid burial date'),
        body('nationality').optional(),
        body('special_requests').optional()
      ];

      const validData = {
        full_name_arabic: 'أحمد محمد علي',
        full_name_english: 'Ahmed Mohammed Ali',
        eid: '123456789012345',
        age_at_death: 75,
        gender: 'male',
        date_of_death: '2024-01-15',
        date_of_burial: '2024-01-16',
        nationality: 'UAE',
        special_requests: 'Test requests'
      };

      const mockReq = { body: validData };
      
      for (const validation of validations) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    test('should fail validation for invalid deceased person data', async () => {
      const validations = [
        body('full_name_arabic').notEmpty().withMessage('Arabic name is required'),
        body('full_name_english').optional(),
        body('eid').notEmpty().withMessage('Emirates ID is required'),
        body('age_at_death').isInt({ min: 0 }).withMessage('Age at death must be a positive integer'),
        body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
        body('date_of_death').isDate().withMessage('Valid date of death is required'),
        body('date_of_burial').optional().isDate().withMessage('Invalid burial date'),
        body('nationality').optional(),
        body('special_requests').optional()
      ];

      const invalidData = {
        full_name_arabic: '',
        full_name_english: '',
        eid: '',
        age_at_death: -1,
        gender: 'invalid',
        date_of_death: 'invalid-date',
        date_of_burial: 'invalid-date'
      };

      const mockReq = { body: invalidData };
      
      for (const validation of validations) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().length).toBeGreaterThan(0);
    });
  });
}); 
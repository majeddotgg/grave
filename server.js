// Islamic Grave Assignment System - Node.js API
// Dependencies
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 8889,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'islamic_grave_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// =============================================
// CEMETERY SECTIONS ROUTES
// =============================================

// Get all cemetery sections
app.get('/api/sections', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        cs.*,
        COUNT(g.grave_id) as total_graves,
        SUM(CASE WHEN g.status = 'available' THEN 1 ELSE 0 END) as available_graves,
        SUM(CASE WHEN g.status = 'occupied' THEN 1 ELSE 0 END) as occupied_graves
      FROM cemetery_sections cs
      LEFT JOIN graves g ON cs.section_id = g.section
      GROUP BY cs.section_id
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// Get specific cemetery section
app.get('/api/sections/:sectionId', 
  [param('sectionId').notEmpty().withMessage('Section ID is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cemetery_sections WHERE section_id = ?',
        [req.params.sectionId]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cemetery section not found'
        });
      }
      
      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new cemetery section
app.post('/api/sections',
  [
    body('section_id').notEmpty().withMessage('Section ID is required'),
    body('section_name').notEmpty().withMessage('Section name is required'),
    body('total_plots').isInt({ min: 0 }).withMessage('Total plots must be a positive integer'),
    body('available_plots').isInt({ min: 0 }).withMessage('Available plots must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { section_id, section_name, total_plots, available_plots, description } = req.body;
      
      await pool.execute(
        'INSERT INTO cemetery_sections (section_id, section_name, total_plots, available_plots, description) VALUES (?, ?, ?, ?, ?)',
        [section_id, section_name, total_plots, available_plots, description || null]
      );
      
      res.status(201).json({
        success: true,
        message: 'Cemetery section created successfully'
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Section ID already exists'
        });
      }
      next(error);
    }
  }
);

// =============================================
// GRAVES ROUTES
// =============================================

// Get all graves
app.get('/api/graves', async (req, res, next) => {
  try {
    const { section, status } = req.query;
    
    let query = `
      SELECT g.*, cs.section_name 
      FROM graves g 
      LEFT JOIN cemetery_sections cs ON g.section = cs.section_id
    `;
    const params = [];
    
    const conditions = [];
    
    if (section) {
      conditions.push('g.section = ?');
      params.push(section);
    }
    
    if (status) {
      conditions.push('g.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY g.section, g.grave_row, g.grave_plot';
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// Get available graves by section
app.get('/api/graves/available/:sectionId',
  [param('sectionId').notEmpty().withMessage('Section ID is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM graves WHERE section = ? AND status = "available" ORDER BY grave_row, grave_plot',
        [req.params.sectionId]
      );
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get specific grave
app.get('/api/graves/:graveId',
  [param('graveId').notEmpty().withMessage('Grave ID is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT g.*, cs.section_name FROM graves g LEFT JOIN cemetery_sections cs ON g.section = cs.section_id WHERE g.grave_id = ?',
        [req.params.graveId]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Grave not found'
        });
      }
      
      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new grave
app.post('/api/graves',
  [
    body('grave_id').notEmpty().withMessage('Grave ID is required'),
    body('section').notEmpty().withMessage('Section is required'),
    body('grave_row').isInt({ min: 1 }).withMessage('Grave row must be a positive integer'),
    body('grave_plot').isInt({ min: 1 }).withMessage('Grave plot must be a positive integer'),
    body('status').optional().isIn(['available', 'occupied', 'maintenance']).withMessage('Invalid status')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { grave_id, section, grave_row, grave_plot, status = 'available' } = req.body;
      
      await pool.execute(
        'INSERT INTO graves (grave_id, section, grave_row, grave_plot, status) VALUES (?, ?, ?, ?, ?)',
        [grave_id, section, grave_row, grave_plot, status]
      );
      
      res.status(201).json({
        success: true,
        message: 'Grave created successfully'
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Grave ID already exists'
        });
      }
      next(error);
    }
  }
);

// =============================================
// DECEASED PERSONS ROUTES
// =============================================

// Get all deceased persons
app.get('/api/deceased', async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM deceased_persons';
    const params = [];
    
    if (search) {
      query += ' WHERE full_name_arabic LIKE ? OR full_name_english LIKE ? OR eid LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY date_of_death DESC';
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// Get specific deceased person
app.get('/api/deceased/:id',
  [param('id').isInt().withMessage('Invalid deceased person ID')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM deceased_persons WHERE deceased_id = ?',
        [req.params.id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Deceased person not found'
        });
      }
      
      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new deceased person record
app.post('/api/deceased',
  [
    body('full_name_arabic').notEmpty().withMessage('Arabic name is required'),
    body('full_name_english').optional(),
    body('eid').notEmpty().withMessage('Emirates ID is required'),
    body('age_at_death').isInt({ min: 0 }).withMessage('Age at death must be a positive integer'),
    body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
    body('date_of_death').isDate().withMessage('Valid date of death is required'),
    body('date_of_burial').optional().isDate().withMessage('Invalid burial date'),
    body('nationality').optional(),
    body('special_requests').optional()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const {
        full_name_arabic,
        full_name_english,
        eid,
        age_at_death,
        gender,
        date_of_death,
        date_of_burial,
        nationality,
        special_requests
      } = req.body;
      
      const [result] = await pool.execute(
        `INSERT INTO deceased_persons 
         (full_name_arabic, full_name_english, eid, age_at_death, gender, date_of_death, date_of_burial, nationality, special_requests) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          full_name_arabic, 
          full_name_english || null, 
          eid, 
          age_at_death, 
          gender, 
          date_of_death, 
          date_of_burial || null, 
          nationality || null, 
          special_requests || null
        ]
      );
      
      res.status(201).json({
        success: true,
        message: 'Deceased person record created successfully',
        deceased_id: result.insertId
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Emirates ID already exists'
        });
      }
      next(error);
    }
  }
);

// =============================================
// GRAVE ASSIGNMENTS ROUTES
// =============================================

// Get all grave assignments
app.get('/api/assignments', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ga.*,
        dp.full_name_arabic,
        dp.full_name_english,
        dp.eid,
        dp.gender,
        dp.date_of_death,
        g.section,
        g.grave_row,
        g.grave_plot,
        cs.section_name
      FROM grave_assignments ga
      JOIN deceased_persons dp ON ga.deceased_id = dp.deceased_id
      JOIN graves g ON ga.grave_id = g.grave_id
      JOIN cemetery_sections cs ON g.section = cs.section_id
      ORDER BY ga.assignment_date DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// Get specific grave assignment
app.get('/api/assignments/:id',
  [param('id').isInt().withMessage('Invalid assignment ID')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const assignmentId = parseInt(req.params.id);
      if (isNaN(assignmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignment ID'
        });
      }
      
      const [rows] = await pool.execute(`
        SELECT 
          ga.*,
          dp.full_name_arabic,
          dp.full_name_english,
          dp.eid,
          dp.gender,
          dp.date_of_death,
          g.section,
          g.grave_row,
          g.grave_plot,
          cs.section_name
        FROM grave_assignments ga
        JOIN deceased_persons dp ON ga.deceased_id = dp.deceased_id
        JOIN graves g ON ga.grave_id = g.grave_id
        JOIN cemetery_sections cs ON g.section = cs.section_id
        WHERE ga.assignment_id = ?
      `, [assignmentId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Grave assignment not found'
        });
      }
      
      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new grave assignment
app.post('/api/assignments',
  [
    body('deceased_id').isInt().withMessage('Valid deceased person ID is required'),
    body('grave_id').notEmpty().withMessage('Grave ID is required'),
    body('assigned_by').notEmpty().withMessage('Assigned by is required'),
    body('burial_date').isDate().withMessage('Valid burial date is required'),
    body('burial_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Valid burial time is required (HH:MM:SS)'),
    body('notes').optional()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { deceased_id, grave_id, assigned_by, burial_date, burial_time, notes } = req.body;
      
      // Check if grave is available
      const [graveCheck] = await connection.execute(
        'SELECT status FROM graves WHERE grave_id = ?',
        [grave_id]
      );
      
      if (graveCheck.length === 0) {
        throw new Error('Grave not found');
      }
      
      if (graveCheck[0].status !== 'available') {
        throw new Error('Grave is not available for assignment');
      }
      
      // Check if deceased person exists
      const [deceasedCheck] = await connection.execute(
        'SELECT deceased_id FROM deceased_persons WHERE deceased_id = ?',
        [deceased_id]
      );
      
      if (deceasedCheck.length === 0) {
        throw new Error('Deceased person not found');
      }
      
      // Create assignment - ensure notes is not undefined
      const [result] = await connection.execute(
        'INSERT INTO grave_assignments (deceased_id, grave_id, assigned_by, burial_date, burial_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [deceased_id, grave_id, assigned_by, burial_date, burial_time, notes || null]
      );
      
      // Update grave status
      await connection.execute(
        'UPDATE graves SET status = "occupied" WHERE grave_id = ?',
        [grave_id]
      );
      
      await connection.commit();
      
      res.status(201).json({
        success: true,
        message: 'Grave assignment created successfully',
        assignment_id: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      
      if (error.message.includes('not found') || error.message.includes('not available')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    } finally {
      connection.release();
    }
  }
);

// Update burial completion status
app.patch('/api/assignments/:id/complete',
  [param('id').isInt().withMessage('Invalid assignment ID')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const assignmentId = parseInt(req.params.id);
      if (isNaN(assignmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignment ID'
        });
      }
      
      const [result] = await pool.execute(
        'UPDATE grave_assignments SET burial_completed = TRUE WHERE assignment_id = ?',
        [assignmentId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Burial marked as completed'
      });
    } catch (error) {
      next(error);
    }
  }
);

// =============================================
// STATISTICS ROUTES
// =============================================

// Get cemetery statistics
app.get('/api/statistics', async (req, res, next) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        cs.section_id,
        cs.section_name,
        COUNT(g.grave_id) as total_graves,
        SUM(CASE WHEN g.status = 'available' THEN 1 ELSE 0 END) as available_graves,
        SUM(CASE WHEN g.status = 'occupied' THEN 1 ELSE 0 END) as occupied_graves,
        SUM(CASE WHEN g.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_graves,
        ROUND((SUM(CASE WHEN g.status = 'occupied' THEN 1 ELSE 0 END) / COUNT(g.grave_id)) * 100, 2) as occupancy_percentage
      FROM cemetery_sections cs
      LEFT JOIN graves g ON cs.section_id = g.section
      GROUP BY cs.section_id, cs.section_name
    `);
    
    // Get overall statistics
    const [overall] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT dp.deceased_id) as total_deceased,
        COUNT(DISTINCT ga.assignment_id) as total_assignments,
        COUNT(CASE WHEN ga.burial_completed = TRUE THEN 1 END) as completed_burials,
        COUNT(CASE WHEN ga.burial_completed = FALSE THEN 1 END) as pending_burials
      FROM deceased_persons dp
      LEFT JOIN grave_assignments ga ON dp.deceased_id = ga.deceased_id
    `);
    
    res.json({
      success: true,
      data: {
        sections: stats,
        overall: overall[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// =============================================
// HEALTH CHECK
// =============================================

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// Apply error handler
app.use(errorHandler);

// 404 handler - FIXED: Use proper catch-all syntax
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Islamic Grave Assignment API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
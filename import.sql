-- Islamic Grave Assignment System Database Schema
-- Compatible with MySQL 5.7+

-- Create database
CREATE DATABASE IF NOT EXISTS islamic_grave_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE islamic_grave_system;

-- =============================================
-- Table: cemetery_sections
-- =============================================
CREATE TABLE cemetery_sections (
    section_id VARCHAR(50) PRIMARY KEY,
    section_name VARCHAR(255) NOT NULL,
    total_plots INT NOT NULL DEFAULT 0,
    available_plots INT NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: graves
-- =============================================
CREATE TABLE graves (
    grave_id VARCHAR(50) PRIMARY KEY,
    section VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    grave_row INT NOT NULL,
    grave_plot INT NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_graves_section 
        FOREIGN KEY (section) REFERENCES cemetery_sections(section_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uk_grave_location UNIQUE (section, grave_row, grave_plot),

    INDEX idx_section (section),
    INDEX idx_status (status),
    INDEX idx_location (section, grave_row, grave_plot),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: deceased_persons
-- =============================================
CREATE TABLE deceased_persons (
    deceased_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name_arabic VARCHAR(255) NOT NULL,
    full_name_english VARCHAR(255),
    eid VARCHAR(15) NOT NULL UNIQUE COMMENT 'Emirates ID',
    age_at_death INT NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    date_of_death DATE NOT NULL,
    date_of_burial DATE,
    nationality VARCHAR(100),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_full_name_arabic (full_name_arabic),
    INDEX idx_full_name_english (full_name_english),
    INDEX idx_eid (eid),
    INDEX idx_gender (gender),
    INDEX idx_date_of_death (date_of_death),
    INDEX idx_date_of_burial (date_of_burial),
    INDEX idx_nationality (nationality),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: grave_assignments
-- =============================================
CREATE TABLE grave_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_id INT NOT NULL,
    grave_id VARCHAR(50) NOT NULL,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255) NOT NULL,
    burial_date DATE NOT NULL,
    burial_time TIME NOT NULL,
    burial_completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignments_deceased 
        FOREIGN KEY (deceased_id) REFERENCES deceased_persons(deceased_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_assignments_grave 
        FOREIGN KEY (grave_id) REFERENCES graves(grave_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uk_grave_assignment UNIQUE (grave_id),
    CONSTRAINT uk_deceased_assignment UNIQUE (deceased_id),

    INDEX idx_deceased_id (deceased_id),
    INDEX idx_grave_id (grave_id),
    INDEX idx_assignment_date (assignment_date),
    INDEX idx_assigned_by (assigned_by),
    INDEX idx_burial_date (burial_date),
    INDEX idx_burial_completed (burial_completed),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Views
-- =============================================

-- View: Available graves by section
CREATE VIEW view_available_graves AS
SELECT 
    g.grave_id,
    g.section,
    cs.section_name,
    g.grave_row,
    g.grave_plot,
    g.status
FROM graves g
JOIN cemetery_sections cs ON g.section = cs.section_id
WHERE g.status = 'available'
ORDER BY g.section, g.grave_row, g.grave_plot;

-- View: Current assignments
CREATE VIEW view_current_assignments AS
SELECT 
    ga.assignment_id,
    ga.assignment_date,
    ga.assigned_by,
    ga.burial_date,
    ga.burial_time,
    ga.burial_completed,
    ga.notes,
    dp.deceased_id,
    dp.full_name_arabic,
    dp.full_name_english,
    dp.eid,
    dp.age_at_death,
    dp.gender,
    dp.date_of_death,
    dp.nationality,
    g.grave_id,
    g.section,
    cs.section_name,
    g.grave_row,
    g.grave_plot
FROM grave_assignments ga
JOIN deceased_persons dp ON ga.deceased_id = dp.deceased_id
JOIN graves g ON ga.grave_id = g.grave_id
JOIN cemetery_sections cs ON g.section = cs.section_id
ORDER BY ga.assignment_date DESC;

-- View: Section statistics
CREATE VIEW view_section_statistics AS
SELECT 
    cs.section_id,
    cs.section_name,
    cs.total_plots,
    cs.available_plots,
    COUNT(g.grave_id) as actual_graves_count,
    SUM(CASE WHEN g.status = 'available' THEN 1 ELSE 0 END) as available_graves,
    SUM(CASE WHEN g.status = 'occupied' THEN 1 ELSE 0 END) as occupied_graves,
    SUM(CASE WHEN g.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_graves,
    SUM(CASE WHEN g.status = 'reserved' THEN 1 ELSE 0 END) as reserved_graves,
    ROUND(
        (SUM(CASE WHEN g.status = 'occupied' THEN 1 ELSE 0 END) / NULLIF(COUNT(g.grave_id), 0)) * 100, 
        2
    ) as occupancy_percentage
FROM cemetery_sections cs
LEFT JOIN graves g ON cs.section_id = g.section
GROUP BY cs.section_id, cs.section_name, cs.total_plots, cs.available_plots
ORDER BY cs.section_id;

-- =============================================
-- Triggers
-- =============================================
DELIMITER //

-- Trigger: mark grave as occupied when assignment is added
CREATE TRIGGER tr_assignment_insert_update_grave_status
AFTER INSERT ON grave_assignments
FOR EACH ROW
BEGIN
    UPDATE graves 
    SET status = 'occupied', updated_at = CURRENT_TIMESTAMP
    WHERE grave_id = NEW.grave_id;
END//

-- Trigger: mark grave as available when assignment is deleted
CREATE TRIGGER tr_assignment_delete_update_grave_status
AFTER DELETE ON grave_assignments
FOR EACH ROW
BEGIN
    UPDATE graves 
    SET status = 'available', updated_at = CURRENT_TIMESTAMP
    WHERE grave_id = OLD.grave_id;
END//

-- Trigger: update available plot count in section on grave status change
CREATE TRIGGER tr_grave_status_update_section_plots
AFTER UPDATE ON graves
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        IF OLD.status = 'available' AND NEW.status IN ('occupied', 'maintenance', 'reserved') THEN
            UPDATE cemetery_sections 
            SET available_plots = available_plots - 1
            WHERE section_id = NEW.section;
        END IF;
        IF OLD.status IN ('occupied', 'maintenance', 'reserved') AND NEW.status = 'available' THEN
            UPDATE cemetery_sections 
            SET available_plots = available_plots + 1
            WHERE section_id = NEW.section;
        END IF;
    END IF;
END//

DELIMITER ;

-- =============================================
-- Sample Data
-- =============================================
INSERT INTO cemetery_sections (section_id, section_name, total_plots, available_plots, description) VALUES
('A', 'Section A - General', 100, 100, 'General burial section for all community members'),
('B-M', 'Section B - Men', 80, 80, 'Dedicated section for male community members'),
('B-W', 'Section B - Women', 80, 80, 'Dedicated section for female community members'),
('C', 'Section C - Children', 50, 50, 'Special section for children under 18'),
('F', 'Section F - Family', 60, 60, 'Family plots for multiple family members');

INSERT INTO graves (grave_id, section, grave_row, grave_plot, status) VALUES
('A-01-01', 'A', 1, 1, 'available'),
('A-01-02', 'A', 1, 2, 'available'),
('A-01-03', 'A', 1, 3, 'available'),
('BM-01-01', 'B-M', 1, 1, 'available'),
('BM-01-02', 'B-M', 1, 2, 'available'),
('BW-01-01', 'B-W', 1, 1, 'available'),
('BW-01-02', 'B-W', 1, 2, 'available'),
('C-01-01', 'C', 1, 1, 'available'),
('F-01-01', 'F', 1, 1, 'available');

-- =============================================
-- Stored Procedures
-- =============================================
DELIMITER //

-- Procedure: Get next available grave in a section
CREATE PROCEDURE sp_get_next_available_grave(
    IN p_section_id VARCHAR(50)
)
BEGIN
    SELECT * FROM graves 
    WHERE section = p_section_id AND status = 'available'
    ORDER BY grave_row, grave_plot 
    LIMIT 1;
END//

-- Procedure: View section report
CREATE PROCEDURE sp_section_occupancy_report()
BEGIN
    SELECT * FROM view_section_statistics;
END//

DELIMITER ;

-- =============================================
-- Optional: Show structure
-- =============================================
SHOW TABLES;
SHOW FULL TABLES WHERE Table_type = 'VIEW';


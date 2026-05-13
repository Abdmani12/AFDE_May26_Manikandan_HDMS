-- Helpdesk Ticket Management System
-- Database Schema

CREATE TABLE IF NOT EXISTS tickets (
    ticket_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name   VARCHAR(100) NOT NULL,
    department      VARCHAR(100) NOT NULL,
    issue_category  VARCHAR(100) NOT NULL,
    description     TEXT         NOT NULL,
    priority        VARCHAR(20)  NOT NULL DEFAULT 'Medium',
    status          VARCHAR(20)  NOT NULL DEFAULT 'Open',
    resolution_notes TEXT,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(issue_category);

-- Sample seed data
INSERT INTO tickets (employee_name, department, issue_category, description, priority, status) VALUES
('Alice Johnson', 'IT', 'VPN Issue', 'Cannot connect to VPN from home. Getting timeout error.', 'High', 'Open'),
('Bob Smith', 'HR', 'Password Reset', 'My account is locked after multiple failed login attempts.', 'Medium', 'In Progress'),
('Carol White', 'Finance', 'Software Installation', 'Need Microsoft Excel installed on my new laptop.', 'Low', 'Resolved'),
('David Lee', 'Engineering', 'Laptop Issue', 'Laptop screen flickering, hard to work.', 'Critical', 'Open'),
('Eva Martinez', 'Marketing', 'Email Access', 'Cannot access company email on mobile device.', 'Medium', 'Open');

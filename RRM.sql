CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    affiliation_date DATE NOT NULL,
    team_id INT REFERENCES teams(id)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_hour DECIMAL(10,2) NOT NULL,
    category_id INT REFERENCES categories(id)
);

CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason VARCHAR(255)
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id),
    team_id INT REFERENCES teams(id),
    user_id INT REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    price DECIMAL(10,2),
    discount DECIMAL(5,2) DEFAULT 0,
    final_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'PENDING'
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);


INSERT INTO teams (name) VALUES ('Robotica'), ('AI Lab');

INSERT INTO users (email, password, name, role, affiliation_date, team_id) VALUES
('admin@usv.ro', '1234', 'Admin', 'ADMIN', '2020-09-01', NULL),
('ion@usv.ro', '1234', 'Ion Popescu', 'LEAD', '2021-10-01', 1),
('ana@usv.ro', '1234', 'Ana Ionescu', 'MEMBER', '2023-10-01', 1),
('maria@usv.ro', '1234', 'Maria Dumitru', 'LEAD', '2019-03-15', 2);

INSERT INTO categories (name) VALUES ('Roboti'), ('Calcul'), ('Sali');

INSERT INTO resources (name, description, price_per_hour, category_id) VALUES
('Brat robotic UR5', 'brat cu 6 axe', 50, 1),
('Cluster USV', 'nod cu GPU', 120, 2),
('Sala C105', '30 locuri', 20, 3);

INSERT INTO maintenance (resource_id, start_time, end_time, reason) VALUES
(2, '2026-11-20 08:00', '2026-11-20 18:00', 'update drivere');

INSERT INTO reservations (resource_id, team_id, user_id, start_time, end_time, price, discount, final_price, status) VALUES
(1, 1, 2, '2026-11-10 10:00', '2026-11-10 12:00', 100, 10, 90, 'CONFIRMED'),
(2, 2, 4, '2026-11-12 09:00', '2026-11-12 13:00', 480, 15, 408, 'CONFIRMED'),
(3, 1, 2, '2026-11-15 14:00', '2026-11-15 16:00', 40, 10, 36, 'PENDING');

INSERT INTO notifications (user_id, message) VALUES
(2, 'Rezervarea pentru Brat robotic UR5 a fost confirmata'),
(4, 'Rezervarea pentru Cluster USV a fost confirmata');

-- NEED-20: date de test pentru catalogul de resurse.
-- Se ruleaza dupa db/RRM.sql.

INSERT INTO categories (name)
SELECT 'Laboratoare'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Laboratoare');

INSERT INTO resources (name, description, price_per_hour, category_id) VALUES
('Brat robotic UR5e',
 'Brat colaborativ Universal Robots, 6 axe, sarcina utila 5 kg, raza 850 mm',
 60, (SELECT id FROM categories WHERE name = 'Roboti')),
('Robot mobil TurtleBot 4',
 'Platforma mobila cu ROS 2, lidar 2D si camera OAK-D',
 35, (SELECT id FROM categories WHERE name = 'Roboti')),
('Nod GPU cluster (2x A100)',
 'Nod dedicat din clusterul USV, 2x NVIDIA A100 80 GB, 256 GB RAM',
 150, (SELECT id FROM categories WHERE name = 'Calcul')),
('Statie de lucru RTX 4090',
 'Statie pentru antrenare modele mici si prototipare, 64 GB RAM',
 40, (SELECT id FROM categories WHERE name = 'Calcul')),
('Sala C204',
 'Sala de seminar, 24 locuri, videoproiector si tabla interactiva',
 25, (SELECT id FROM categories WHERE name = 'Sali')),
('Laborator imprimare 3D',
 '2 imprimante Prusa MK4 si o imprimanta cu rasina Form 3',
 30, (SELECT id FROM categories WHERE name = 'Laboratoare'));

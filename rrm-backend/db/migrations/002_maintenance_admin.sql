-- NEED-30: tabela de mentenanta retine si adminul care a setat perioada.

ALTER TABLE maintenance
    ADD COLUMN IF NOT EXISTS admin_id INT REFERENCES users(id);

ALTER TABLE maintenance
    DROP CONSTRAINT IF EXISTS maintenance_interval_check;
ALTER TABLE maintenance
    ADD CONSTRAINT maintenance_interval_check CHECK (end_time > start_time);

CREATE INDEX IF NOT EXISTS idx_maintenance_resource_interval
    ON maintenance (resource_id, start_time, end_time);

-- perioada de test existenta a fost setata de admin
UPDATE maintenance
SET admin_id = (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id LIMIT 1)
WHERE admin_id IS NULL;

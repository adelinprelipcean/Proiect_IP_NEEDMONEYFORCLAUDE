-- NEED-16: constrangeri pe users si teams + team lead-ul echipei.

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('MEMBER', 'LEAD', 'ADMIN'));

ALTER TABLE teams
    DROP CONSTRAINT IF EXISTS teams_name_key;
ALTER TABLE teams
    ADD CONSTRAINT teams_name_key UNIQUE (name);

ALTER TABLE teams
    ADD COLUMN IF NOT EXISTS lead_id INT REFERENCES users(id);

-- lead-ul fiecarei echipe e userul cu rolul LEAD din ea
UPDATE teams t
SET lead_id = (SELECT u.id FROM users u
               WHERE u.team_id = t.id AND u.role = 'LEAD'
               ORDER BY u.id LIMIT 1)
WHERE lead_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_team ON users (team_id);

-- NEED-24: constrangeri pe reservations.
-- Pe langa verificarea din backend, baza de date nu permite doua rezervari
-- PENDING/CONFIRMED pe aceeasi resursa cu intervale care se suprapun.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS reservations_interval_check;
ALTER TABLE reservations
    ADD CONSTRAINT reservations_interval_check CHECK (end_time > start_time);

ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations
    ADD CONSTRAINT reservations_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'));

ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS reservations_discount_check;
ALTER TABLE reservations
    ADD CONSTRAINT reservations_discount_check
    CHECK (discount BETWEEN 0 AND 25);

ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS reservations_no_overlap;
ALTER TABLE reservations
    ADD CONSTRAINT reservations_no_overlap
    EXCLUDE USING gist (
        resource_id WITH =,
        tsrange(start_time, end_time) WITH &&
    ) WHERE (status IN ('PENDING', 'CONFIRMED'));

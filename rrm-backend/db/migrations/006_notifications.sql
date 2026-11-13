-- NEED-34: notificarea poate fi legata de rezervarea despre care e vorba.

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS reservation_id INT
    REFERENCES reservations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications (user_id, is_read);

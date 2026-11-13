-- NEED-17: parolele utilizatorilor de test erau salvate in clar ('1234').
-- Le inlocuim cu hash-ul pbkdf2 al aceleiasi parole, ca loginul sa mearga.

UPDATE users
SET password = 'pbkdf2_sha256$600000$45188d5552616dd3681b037b2e681923$35b00751859a3e54029ea21ae90a7e6d4fd3f0d487ba4d56d190612f4e849344'
WHERE password = '1234';

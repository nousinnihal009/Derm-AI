import sqlite3

conn = sqlite3.connect('c:/CODES/project_nousin/skincare-app/backend/dermai.db')
conn.row_factory = sqlite3.Row
for row in conn.execute('SELECT email, username, password_hash FROM users').fetchall():
    print(dict(row))
conn.close()

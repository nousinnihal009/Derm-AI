import sqlite3

conn = sqlite3.connect('c:/CODES/project_nousin/skincare-app/backend/dermai.db')
conn.row_factory = sqlite3.Row
user = conn.execute("SELECT email, username, password_hash FROM users WHERE email = 'ajahxa@gmail.com'").fetchone()

if user:
    print("User found:")
    print(dict(user))
else:
    print("User 'ajahxa@gmail.com' NOT found in the database.")
    
for row in conn.execute("SELECT email, username FROM users").fetchall():
    print(dict(row))

conn.close()

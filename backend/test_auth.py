import urllib.request
import urllib.error
import urllib.parse
import json
import string
import random

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

base_url = "http://localhost:8000/api/auth"

# Register a random user
email = f"{random_string()}@test.com"
username = random_string()
password = "password123"

def make_request(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')

print(f"Registering {email} / {password}...")
status, text = make_request(f"{base_url}/register", {
    "email": email,
    "username": username,
    "password": password
})
print("Register response:", status, text)

# Attempt login
print(f"Logging in with {email} / {password}...")
status, text = make_request(f"{base_url}/login", {
    "email": email,
    "password": password
})
print("Login response:", status, text)

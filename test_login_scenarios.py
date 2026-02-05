import requests

# Test with /login/ (no /api)
url = 'http://localhost:8000/login/'
data = {'username': 'admin', 'password': 'admin123'}

try:
    response = requests.post(url, json=data)
    print(f"URL: {url}")
    print(f"Status Code: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

# Test with /api/login/ but wrong credentials
url = 'http://localhost:8000/api/login/'
data = {'username': 'admin', 'password': 'wrong_password'}

try:
    response = requests.post(url, json=data)
    print(f"URL: {url} (Wrong Credentials)")
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

import requests

url = 'http://localhost:8000/api/login/'
data = {'username': 'admin', 'password': 'admin123'}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

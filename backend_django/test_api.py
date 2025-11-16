import requests
import json

# 회원가입 API 테스트
def test_register():
    url = "http://localhost:8000/api/auth/register"
    data = {
        "email": "test3@example.com",
        "username": "testuser3",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

# 로그인 API 테스트
def test_login():
    url = "http://localhost:8000/api/auth/login"
    data = {
        "email": "test3@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("=== 회원가입 테스트 ===")
    test_register()
    
    print("\n=== 로그인 테스트 ===")
    test_login()

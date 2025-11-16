import requests
import json

# 카카오 로그인 API 테스트
def test_kakao_login():
    url = "http://localhost:8000/api/auth/kakao-login"
    data = {
        "access_token": "fake_kakao_token_for_testing"
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
    print("=== 카카오 로그인 테스트 ===")
    test_kakao_login()

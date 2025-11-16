from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # 카카오 로그인 관련
    path('kakao-login', views.kakao_login_view, name='kakao-login'),
    path('kakao-token-exchange', views.kakao_token_exchange_view, name='kakao-token-exchange'),
    path('token/refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('me', views.me_view, name='user-me'),
    
    # 테스트
    path('test-db', views.test_db_connection, name='test-db'),
    
    # 사용자 관리
    path('', views.UserListView.as_view(), name='user-list'),
    path('<int:pk>', views.UserDetailView.as_view(), name='user-detail'),
    path('check-nickname', views.check_nickname_view, name='check-nickname'),
]

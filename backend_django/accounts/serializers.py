from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
import requests
import logging

logger = logging.getLogger(__name__)




class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 시리얼라이저"""
    class Meta:
        model = User
        fields = ('id', 'userid', 'nickname', 'image', 'introduce', 'is_active', 'is_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'is_verified', 'created_at', 'updated_at')


class UserUpdateSerializer(serializers.ModelSerializer):
    """사용자 정보 수정 시리얼라이저"""
    class Meta:
        model = User
        fields = ('nickname', 'image', 'introduce')
    
    def validate_nickname(self, value):
        if self.instance and self.instance.nickname != value:
            if not User.is_nickname_available(value, self.instance.id):
                raise serializers.ValidationError("이미 사용 중인 닉네임입니다.")
        return value


class KakaoLoginSerializer(serializers.Serializer):
    """카카오 로그인 시리얼라이저"""
    access_token = serializers.CharField()
    
    def validate(self, attrs):
        access_token = attrs.get('access_token')
        
        if not access_token:
            raise serializers.ValidationError("카카오 액세스 토큰이 필요합니다.")
        
        # 카카오 API로 사용자 정보 가져오기
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
            
            response = requests.get('https://kapi.kakao.com/v2/user/me', headers=headers)
            
            if response.status_code != 200:
                raise serializers.ValidationError("카카오 토큰이 유효하지 않습니다.")
            
            kakao_data = response.json()
            logger.info(f"카카오 사용자 정보: {kakao_data}")
            
            # 카카오 사용자 정보에서 필요한 데이터 추출
            kakao_id = str(kakao_data.get('id'))
            kakao_account = kakao_data.get('kakao_account', {})
            profile = kakao_account.get('profile', {})
            
            # 이름 길이 제한 (10자 - 안전한 한글 길이)
            nickname = profile.get('nickname', f'kakao_{kakao_id}')
            if len(nickname) > 10:
                nickname = nickname[:10]
            
            # 이미지 URL 길이 제한 (500자)
            image = profile.get('image')
            if image and len(image) > 500:
                image = image[:500]
            
            # 기존 사용자 확인 또는 새 사용자 생성
            user, created = User.objects.get_or_create(
                userid=f'kakao_{kakao_id}',
                defaults={
                    'nickname': nickname,
                    'image': image,
                    'is_verified': True,
                }
            )
            
            if not created and user.userid.startswith('kakao_'):
                # 기존 카카오 사용자의 정보 업데이트
                user.nickname = nickname
                user.image = image
                user.is_verified = True
                user.save()
            
            attrs['user'] = user
            attrs['kakao_id'] = kakao_id
            
        except requests.RequestException as e:
            logger.error(f"카카오 API 요청 실패: {str(e)}")
            raise serializers.ValidationError("카카오 서버와 통신 중 오류가 발생했습니다.")
        except Exception as e:
            logger.error(f"카카오 로그인 처리 중 오류: {str(e)}")
            raise serializers.ValidationError("카카오 로그인 처리 중 오류가 발생했습니다.")
        
        return attrs

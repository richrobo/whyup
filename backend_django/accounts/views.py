from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging
from .serializers import (
    UserSerializer, 
    UserUpdateSerializer,
    KakaoLoginSerializer
)
from .models import User

logger = logging.getLogger(__name__)

User = get_user_model()




@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """현재 사용자 정보 조회"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserListView(generics.ListAPIView):
    """사용자 목록 조회 (관리자용)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """사용자 상세 조회/수정"""
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def update(self, request, *args, **kwargs):
        logger.info(f"사용자 정보 수정 요청: {request.data}")
        logger.info(f"요청 사용자 ID: {request.user.id}, 대상 사용자 ID: {kwargs['pk']}")
        
        # 본인만 수정 가능
        if request.user.id != int(kwargs['pk']):
            logger.warning(f"권한 없는 사용자 정보 수정 시도: {request.user.id} -> {kwargs['pk']}")
            return Response(
                {'detail': '본인의 정보만 수정할 수 있습니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"사용자 정보 수정 중 오류: {str(e)}", exc_info=True)
            return Response(
                {'detail': f'사용자 정보 수정 중 오류가 발생했습니다: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        # 본인만 삭제 가능
        if request.user.id != kwargs['pk']:
            return Response(
                {'detail': '본인의 계정만 삭제할 수 있습니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({'message': '계정이 비활성화되었습니다'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def kakao_login_view(request):
    """카카오 로그인 (액세스 토큰 방식)"""
    logger.info(f"카카오 로그인 요청: {request.data}")
    try:
        serializer = KakaoLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            logger.info(f"카카오 로그인 성공: user_id={user.id}, email={user.email}")
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'token_type': 'bearer',
                'user': UserSerializer(user).data
            })
        else:
            logger.error(f"카카오 로그인 실패 - 유효성 검사 오류: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"카카오 로그인 중 예외 발생: {str(e)}", exc_info=True)
        return Response({
            'error': '카카오 로그인 중 오류가 발생했습니다',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def kakao_token_exchange_view(request):
    """카카오 인증 코드를 액세스 토큰으로 교환 (CORS 해결용)"""
    logger.info(f"카카오 토큰 교환 요청: {request.data}")
    logger.info(f"요청 헤더: {dict(request.headers)}")
    logger.info(f"요청 메타: {dict(request.META)}")
    try:
        code = request.data.get('code')
        logger.info(f"받은 인증 코드: {code}")
        if not code:
            logger.error("인증 코드가 없습니다")
            return Response({'error': '인증 코드가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 중복 요청 방지를 위한 간단한 체크
        import time
        current_time = int(time.time())
        cache_key = f"kakao_code_{code}"
        
        # 간단한 메모리 캐시로 중복 요청 방지
        if not hasattr(kakao_token_exchange_view, '_processed_codes'):
            kakao_token_exchange_view._processed_codes = {}
        
        # 이미 처리된 코드인지 확인
        if code in kakao_token_exchange_view._processed_codes:
            processed_time = kakao_token_exchange_view._processed_codes[code]
            # 5분 이내에 처리된 코드는 중복으로 간주
            if current_time - processed_time < 300:
                logger.warning(f"중복 요청 감지: {code}")
                return Response({
                    'error': '이미 처리된 인증 코드입니다. 잠시 후 다시 시도해주세요.',
                    'detail': '중복 요청이 감지되었습니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # 코드를 처리된 것으로 표시
        kakao_token_exchange_view._processed_codes[code] = current_time
        
        # 카카오 토큰 교환 API 호출
        import requests
        
        REST_API_KEY = '3f136af5426d0667ca9541cf878c2246'
        REDIRECT_URI = 'https://whyup.vercel.app/auth/kakao/callback'
        
        token_response = requests.post('https://kauth.kakao.com/oauth/token', {
            'grant_type': 'authorization_code',
            'client_id': REST_API_KEY,
            'redirect_uri': REDIRECT_URI,
            'code': code,
        })
        
        if token_response.status_code != 200:
            error_data = token_response.json() if token_response.headers.get('content-type', '').startswith('application/json') else {}
            error_code = error_data.get('error_code', '')
            error_description = error_data.get('error_description', '')
            
            logger.error(f"카카오 토큰 교환 실패: {token_response.text}")
            
            if error_code == 'KOE320':
                return Response({
                    'error': '인증 코드가 이미 사용되었거나 만료되었습니다. 다시 로그인해주세요.',
                    'detail': error_description,
                    'error_code': error_code
                }, status=status.HTTP_400_BAD_REQUEST)
            elif error_code == 'KOE237':
                return Response({
                    'error': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
                    'detail': error_description,
                    'error_code': error_code
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            else:
                return Response({
                    'error': '카카오 토큰 교환에 실패했습니다',
                    'detail': error_description or token_response.text,
                    'error_code': error_code
                }, status=status.HTTP_400_BAD_REQUEST)
        
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        
        if not access_token:
            return Response({'error': '액세스 토큰을 받을 수 없습니다'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 액세스 토큰으로 사용자 정보 가져오기
        user_response = requests.get('https://kapi.kakao.com/v2/user/me', 
                                   headers={'Authorization': f'Bearer {access_token}'})
        
        if user_response.status_code != 200:
            logger.error(f"카카오 사용자 정보 조회 실패: {user_response.text}")
            return Response({
                'error': '카카오 사용자 정보를 가져올 수 없습니다',
                'detail': user_response.text
            }, status=status.HTTP_400_BAD_REQUEST)
        
        kakao_data = user_response.json()
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
        image = profile.get('profile_image_url')
        if image and len(image) > 500:
            image = image[:500]
        
        # 기존 사용자 확인 또는 새 사용자 생성 (userid 기준)
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
        
        # JWT 토큰 생성
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"카카오 토큰 교환 성공: user_id={user.id}, userid={user.userid}")
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'token_type': 'bearer',
            'user': UserSerializer(user).data,
            'kakao_access_token': access_token,
            'kakao_refresh_token': token_data.get('refresh_token')
        })
        
    except Exception as e:
        logger.error(f"카카오 토큰 교환 중 예외 발생: {str(e)}", exc_info=True)
        import traceback
        logger.error(f"전체 스택 트레이스: {traceback.format_exc()}")
        return Response({
            'error': '카카오 토큰 교환 중 오류가 발생했습니다',
            'detail': str(e),
            'traceback': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_db_connection(request):
    """데이터베이스 연결 테스트"""
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        return Response({
            'status': 'success',
            'message': '데이터베이스 연결 성공',
            'result': result
        })
    except Exception as e:
        logger.error(f"데이터베이스 연결 테스트 실패: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'message': '데이터베이스 연결 실패',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_nickname_view(request):
    """닉네임 중복 확인"""
    nickname = request.GET.get('nickname')
    if not nickname:
        return Response({'error': '닉네임이 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 현재 로그인한 사용자 ID (닉네임 변경 시 자기 자신 제외)
    exclude_user_id = None
    if request.user.is_authenticated:
        exclude_user_id = request.user.id
    
    is_available = User.is_nickname_available(nickname, exclude_user_id)
    
    return Response({
        'nickname': nickname,
        'available': is_available,
        'message': '사용 가능한 닉네임입니다' if is_available else '이미 사용 중인 닉네임입니다'
    })


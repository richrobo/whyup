from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
import requests
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def upbit_market_all(request):
    """Upbit 마켓 목록 프록시"""
    try:
        response = requests.get('https://api.upbit.com/v1/market/all', timeout=10)
        response.raise_for_status()
        return JsonResponse(response.json(), safe=False)
    except requests.exceptions.RequestException as e:
        logger.error(f'Upbit API 요청 실패: {e}')
        return JsonResponse(
            {'error': 'Upbit API 요청에 실패했습니다.'},
            status=500
        )


import os
from celery import Celery

# Django 설정 모듈 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whyup.settings')

app = Celery('whyup')

# Django 설정에서 Celery 설정 로드
app.config_from_object('django.conf:settings', namespace='CELERY')

# 등록된 Django 앱에서 태스크 자동 검색
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

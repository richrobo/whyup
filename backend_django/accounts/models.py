from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class UserManager(BaseUserManager):
    """커스텀 User 매니저"""
    def create_user(self, userid, password=None, **extra_fields):
        if not userid:
            raise ValueError('사용자ID는 필수입니다')
        
        user = self.model(userid=userid, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, userid, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('슈퍼유저는 is_staff=True여야 합니다')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('슈퍼유저는 is_superuser=True여야 합니다')
        
        return self.create_user(userid, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """확장된 사용자 모델"""
    userid = models.CharField(max_length=150, unique=True, verbose_name="사용자ID")
    nickname = models.CharField(max_length=50, unique=True, verbose_name="닉네임")
    email = models.EmailField(blank=True, null=True, verbose_name="이메일")
    image = models.URLField(max_length=500, blank=True, null=True, verbose_name="프로필 이미지")
    introduce = models.TextField(blank=True, null=True, verbose_name="자기소개")
    is_verified = models.BooleanField(default=False, verbose_name="인증 여부")
    is_active = models.BooleanField(default=True, verbose_name="활성 상태")
    is_staff = models.BooleanField(default=False, verbose_name="스태프 여부")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    # userid를 기본 사용자명 필드로 사용
    USERNAME_FIELD = 'userid'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = "사용자"
        verbose_name_plural = "사용자들"
        db_table = "tb_users"  # 원하는 테이블명으로 변경 가능
    
    def __str__(self):
        return self.userid
    
    @property
    def get_full_name(self):
        return self.nickname or self.username
    
    def clean(self):
        """모델 검증"""
        super().clean()
        if self.nickname:
            # 닉네임 중복 확인 (자기 자신 제외)
            existing_user = User.objects.filter(nickname=self.nickname).exclude(pk=self.pk)
            if existing_user.exists():
                raise ValidationError({'nickname': '이미 사용 중인 닉네임입니다.'})
    
    def save(self, *args, **kwargs):
        """저장 전 검증"""
        self.clean()
        super().save(*args, **kwargs)
    
    @classmethod
    def is_nickname_available(cls, nickname, exclude_user_id=None):
        """닉네임 사용 가능 여부 확인"""
        queryset = cls.objects.filter(nickname=nickname)
        if exclude_user_id:
            queryset = queryset.exclude(pk=exclude_user_id)
        return not queryset.exists()
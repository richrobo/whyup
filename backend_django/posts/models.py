from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Post(models.Model):
    """게시물 모델"""
    title = models.CharField(max_length=200, verbose_name="제목")
    content = models.TextField(verbose_name="내용")
    summary = models.CharField(max_length=300, blank=True, null=True, verbose_name="요약")
    is_published = models.BooleanField(default=False, verbose_name="발행 여부")
    view_count = models.PositiveIntegerField(default=0, verbose_name="조회수")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    # 외래키
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name="작성자"
    )
    
    class Meta:
        verbose_name = "게시물"
        verbose_name_plural = "게시물들"
        db_table = "tb_posts"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def increment_view_count(self):
        """조회수 증가"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
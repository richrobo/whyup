from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """게시물 관리자 인터페이스"""
    list_display = ('title', 'author', 'is_published', 'view_count', 'created_at')
    list_filter = ('is_published', 'created_at', 'author')
    search_fields = ('title', 'content', 'author__username', 'author__email')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('기본 정보', {'fields': ('title', 'content', 'summary')}),
        ('발행 설정', {'fields': ('is_published',)}),
        ('통계', {'fields': ('view_count',)}),
        ('작성자', {'fields': ('author',)}),
        ('날짜', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ('view_count', 'created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author')
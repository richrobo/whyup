from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """사용자 관리자 인터페이스"""
    list_display = ('userid', 'nickname', 'email', 'is_active', 'is_verified', 'created_at')
    list_filter = ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'created_at')
    search_fields = ('userid', 'nickname', 'email')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('userid', 'password')}),
        ('개인 정보', {'fields': ('nickname', 'email', 'image', 'introduce')}),
        ('권한', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('중요한 날짜', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('userid', 'nickname', 'email', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')
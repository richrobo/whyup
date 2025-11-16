from rest_framework import serializers
from .models import Post
from accounts.serializers import UserSerializer


class PostSerializer(serializers.ModelSerializer):
    """게시물 시리얼라이저"""
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Post
        fields = (
            'id', 'title', 'content', 'summary', 'is_published', 
            'view_count', 'created_at', 'updated_at', 'author', 'author_id'
        )
        read_only_fields = ('id', 'view_count', 'created_at', 'updated_at', 'author')


class PostCreateSerializer(serializers.ModelSerializer):
    """게시물 생성 시리얼라이저"""
    class Meta:
        model = Post
        fields = ('title', 'content', 'summary', 'is_published')
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PostUpdateSerializer(serializers.ModelSerializer):
    """게시물 수정 시리얼라이저"""
    class Meta:
        model = Post
        fields = ('title', 'content', 'summary', 'is_published')


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """게시물 생성/수정 시리얼라이저"""
    class Meta:
        model = Post
        fields = ('title', 'content', 'summary', 'is_published')

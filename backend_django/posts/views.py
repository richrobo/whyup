from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from posts.models import Post
from posts.serializers import PostSerializer, PostCreateUpdateSerializer
from accounts.models import User

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # published_only 필터링 (기본값 True)
            published_only = self.request.query_params.get('published_only', 'true').lower() == 'true'
            if published_only:
                queryset = queryset.filter(is_published=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # 조회수 증가
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({"detail": "본인이 작성한 게시물만 수정할 수 있습니다"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PostCreateUpdateSerializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({"detail": "본인이 작성한 게시물만 삭제할 수 있습니다"}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response({"message": "게시물이 삭제되었습니다"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[0-9]+)')
    def user_posts(self, request, user_id=None):
        user = get_object_or_404(User, id=user_id)
        queryset = self.get_queryset().filter(author=user)
        
        published_only = request.query_params.get('published_only', 'true').lower() == 'true'
        if published_only:
            queryset = queryset.filter(is_published=True)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
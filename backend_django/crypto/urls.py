from django.urls import path
from . import views

urlpatterns = [
    path('upbit/market/all', views.upbit_market_all, name='upbit-market-all'),
]


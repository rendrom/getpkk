from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^get/(?P<code>[0-9-:e.]+)', views.get_area, name="getpkk"),
    url(r'^(?P<code>[0-9-:e.]+)$', views.GetAreaView.as_view(), name="pkk_by_code"),
    url(r'^', views.GetAreaView.as_view(), name="pkk")   
]
from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^logout$', 'Auth.views.logout_req'),
    # Social Auth 
    url(r'^facebook$', 'Auth.views.facebook_login'),
    url(r'^facebook/callback$','Auth.views.facebook_login_callback'),
    url(r'^google$', 'Auth.views.google_login'),
    url(r'^google/callback$', 'Auth.views.google_login_callback'),
)

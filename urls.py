from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'clean_india.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^$', 'clean_india.views.landing_page'),
    url(r'^get_spotfix$', 'clean_india.views.get_spotfix'),
    url(r'^spotfix/create/$', 'clean_india.views.create_spotfix_page'),
    url(r'^spotfix/create/new/$', 'clean_india.views.create_spotfix'),
    url(r'^join_spotfix$', 'clean_india.views.join_spotfix'),
    url(r'^spotfix/join/(?P<spotfix_id>[0-9]+)$', 'clean_india.views.spotfix_join_page'),
    url(r'^spotfix/get_details$', 'clean_india.views.get_spotfix_details'),
    url(r'^accounts/login/$', 'clean_india.views.signup_page'),
    url(r'^auth/', include('Auth.urls')),
)

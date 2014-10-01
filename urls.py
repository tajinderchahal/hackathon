from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'clean_india.views.landing_page'),
    url(r'^get_spotfix$', 'clean_india.views.get_spotfix'), 
    
    # Spotfix creation
    url(r'^spotfix/create/$', 'clean_india.views.create_spotfix_page'),
    url(r'^spotfix/create/new/$', 'clean_india.views.create_spotfix'),
 
    # Join Spotfix
    url(r'^join_spotfix$', 'clean_india.views.join_spotfix'),
    url(r'^spotfix/join/(?P<spotfix_id>[0-9]+)$', 'clean_india.views.spotfix_join_page'),
    url(r'^spotfix/get_details$', 'clean_india.views.get_spotfix_details'),

    # Manage
    url(r'^spotfix/created/(?P<user_id>[0-9]+)$', 'clean_india.views.created_spotfix_page'),
    url(r'^spotfix/created_list$', 'clean_india.views.get_created_spotfix_by_user'),
    url(r'^spotfix/joined/(?P<user_id>[0-9]+)$', 'clean_india.views.joined_spotfix_page'),
    url(r'^spotfix/joined_list$', 'clean_india.views.get_joined_spotfix_by_user'),

    # Report Spotfix 
    url(r'^spotfix/report/(?P<spotfix_id>[0-9]+)$', 'clean_india.views.report_spotfix_page'),
    url(r'^spotfix/report/done$', 'clean_india.views.report_spotfix'),
    
    # SpotFix image gallery
    url(r'^spotfix/gallery/(?P<spotfix_id>[0-9]+)$', 'clean_india.views.spotfix_image_gallery'),
    url(r'^spotfix/get_image$', 'clean_india.views.get_spotfix_image'),
    
    # Authentication and Profile
    url(r'^auth/', include('Auth.urls')),
    url(r'^accounts/login/$', 'clean_india.views.signup_page'),
    url(r'^profile/(?P<user_id>[0-9]+)$', 'clean_india.views.profile_page'),
)

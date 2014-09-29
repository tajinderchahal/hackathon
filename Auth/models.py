from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class UserProfile(User):
    profile_image = models.TextField(default="/static/image/default_dp.png")
    spotfix_attended = models.IntegerField(default=0)
    spotfix_created = models.IntegerField(default=0)
    no_of_hour = models.IntegerField(default=0)
    source = models.CharField(max_length=20)
    fb_user_id = models.CharField(max_length=100, null=True, blank=True)
    base_location = models.CharField(max_length=100, null=True, blank=True)
    phone_num = models.TextField()
    

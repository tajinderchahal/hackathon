from django.db import models
from Auth.models import UserProfile

# Create your models here.


class SpotFix(models.Model):
    user = models.ForeignKey(UserProfile, null=True, blank=True)
    name = models.TextField(null=True, blank=True)
    starttime = models.DateTimeField(null=True, blank=True)
    endtime = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=1, default="A")
    latitude = models.DecimalField(max_digits=15, decimal_places=10, null=True, blank=True)
    longitude = models.DecimalField(max_digits=15, decimal_places=10, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    participate_no = models.IntegerField(default=1)
    remarks = models.TextField(null=True, blank=True)
    min_required = models.IntegerField(default=1)
    created_on = models.DateTimeField(auto_now=True)


class SpotFixImages(models.Model):
    spotfix = models.ForeignKey(SpotFix, null=True, blank=True)
    image = models.ImageField(upload_to="static/spot_image/", null=True, blank=True)
    state = models.CharField(max_length=1, default="B") # B: Before, A: After
    uploaded_on = models.DateTimeField(auto_now=True)   

class JoinedSpotFix(models.Model):
    spotfix = models.ForeignKey(SpotFix, null=True, blank=True)
    user = models.ForeignKey(UserProfile, null=True, blank=True) 
    initiator = models.BooleanField(default=False)
    joined_on = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=1, default="A")
    

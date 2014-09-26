from django.db import models

# Create your models here.


class SpotFix(models.Modal):
    name = models.TextField(null=True, blank=True)
    starttime = models.DateTimeField(null=True, blank=True)
    endtime = models.DateTimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=1, default="A")
    latitude = models.DecimalField(null=True, blank=True)
    longitude = models.DecimalField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    participate_no = models.IntegerField(default=1)
    remarks = models.TextField(null=True, blank=True)



class SpotFixImages(models.Model):
    spotfix = models.ForiengKey(SpotFix, null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    state = models.CharField(max_length=1, default="B") # B: Before, A: After
    uploaded_on = models.DateTimeField(auto=True)    

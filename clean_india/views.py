from django.shortcuts import render
from django.shortcuts import render, redirect, render_to_response
from django.http import HttpResponse
from django.template import RequestContext
from django.core.serializers.json import DjangoJSONEncoder
from django.core.cache import cache
from settings import CACHE_TIME_TO_LIVE
from clean_india.models import SpotFix, SpotFixImages, JoinedSpotFix
from django.core.files.base import ContentFile
import math
import json
from Auth.models import UserProfile
from django.db.models import F
from django.contrib.auth.decorators import login_required


def landing_page(request):
    return render_to_response('landing_page.jade',
    context_instance=RequestContext(request))

def signup_page(request):
    return render_to_response('login_page.jade',
    context_instance=RequestContext(request))
 
@login_required
def create_spotfix_page(request):
    return render_to_response('create_spotfix.jade',
    context_instance=RequestContext(request))

@login_required
def create_spotfix(request):
    try:
        spot_image = request.FILES['spot_image']
        latitude = request.POST['latitude']
        longitude = request.POST['longitude']
        address = request.POST['address']
        description = request.POST['description']
        starttime = request.POST['starttime']
        phone_num = request.POST['phone_num'] 
      
        userprofile = UserProfile.objects.get(id = request.user.id)
        userprofile.phone_num = phone_num
        userprofile.save()
 
        new_spotfix = SpotFix(**{
            'starttime': starttime,
            'description': description,
            'address': address,
            'latitude': latitude,
            'longitude': longitude,
            'user_id': request.user.id
        });
        new_spotfix.save()

        new_joiniee = JoinedSpotFix(**{
            'spotfix_id': new_spotfix.id,
            'user_id': request.user.id,
            'initiator': True
        })
        new_joiniee.save()
   
        #for spot_image in request.FILES: 
        content_file = ContentFile(spot_image.read())
        new_spot_image = SpotFixImages()
        new_spot_image.spotfix = new_spotfix
        new_spot_image.image.save(spot_image.name, content_file)
        new_spot_image.save()

        return HttpResponse(json.dumps({
            'status': 1,
            'msg': 'Success'
        }))
    except Exception, e:
        print str(e)
        return HttpResponse(json.dumps({
            'status': 0,
            'msg': str(e)
        }))


def get_spotfix(request):
    curr_lat = float(request.GET['latitude'])
    curr_lng = float(request.GET['longitude'])
    radius = float(request.GET['radius'])
    #sfdate = request.GET['sfdate']
    new_coordinates = get_bounding_box(curr_lat, curr_lng, radius/1000)

    spotfix_list = list(SpotFix.objects.filter(latitude__lte = \
                        new_coordinates.lat_max, longitude__lte = \
                        new_coordinates.lon_max).values('address', \
                        'description', 'starttime', 'participate_no',\
                        'min_required', 'user__first_name', 'user__last_name',\
                        'user__phone_num', 'id', 'latitude', 'longitude',\
                        'status', 'endtime'))
    spotfix_ids = [int(c['id']) for c in spotfix_list]
    spotfix_images = SpotFixImages.objects.filter(spotfix__in = spotfix_ids).values()
    image_dict = {}
    for img in spotfix_images:
        image_dict.setdefault(img['spotfix_id'], []).append([img['image'], img['state']]) 
    return HttpResponse(json.dumps({
        'locations': spotfix_list,
        'image_dict': image_dict
    }, cls=DjangoJSONEncoder))

@login_required
def spotfix_join_page(request, spotfix_id):
    return render_to_response('spotfix_page.jade',
      {'spotfix_id': spotfix_id}, 
      context_instance=RequestContext(request))


@login_required
def join_spotfix(request):
    try:
        jsf = JoinedSpotFix.objects.filter(user_id = request.user.id)
        if len(jsf):
          return HttpResponse(json.dumps({
            'status': 2,
            'msg': 'Already Joined'
          }))
        spotfix_id = request.POST['sf_id']
        new_joiniee = JoinedSpotFix(**{
            'spotfix_id': spotfix_id,
            'user_id': request.user.id
        })
        new_joiniee.save()
        user = request.user
        user.userprofile.phone_num = request.POST['phone_num']
        user.userprofile.save()

        SpotFix.objects.filter(id = spotfix_id).update(participate_no=F('participate_no')+1)
        return HttpResponse(json.dumps({
            'status': 1,
            'msg': 'Joined'
        }))
    except Exception, e:
        print str(e)
        return HttpResponse(json.dumps({
            'status': 0,
            'msg': str(e)
        }))


class BoundingBox(object):
    def __init__(self, *args, **kwargs):
       # self.lat_min = None
       # self.lon_min = None
        self.lat_max = None
        self.lon_max = None


def get_bounding_box(latitude_in_degrees, longitude_in_degrees, half_side_in_km):
    assert half_side_in_km > 0
    assert latitude_in_degrees >= -180.0 and latitude_in_degrees  <= 180.0
    assert longitude_in_degrees >= -180.0 and longitude_in_degrees <= 180.0

    #half_side_in_km = half_side_in_miles * 1.609344
    lat = math.radians(latitude_in_degrees)
    lon = math.radians(longitude_in_degrees)

    radius  = 6371
    # Radius of the parallel at given latitude
    parallel_radius = radius*math.cos(lat)

    #lat_min = lat - half_side_in_km/radius
    lat_max = lat + half_side_in_km/parallel_radius
    #lon_min = lon - half_side_in_km/parallel_radius
    lon_max = lon + half_side_in_km/parallel_radius
    rad2deg = math.degrees

    box = BoundingBox()
    #box.lat_min = rad2deg(lat_min)
    #box.lon_min = rad2deg(lon_min)
    box.lat_max = rad2deg(lat_max)
    box.lon_max = rad2deg(lon_max)
    return (box)

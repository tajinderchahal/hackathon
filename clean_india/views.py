from django.shortcuts import render
from django.shortcuts import render, redirect, render_to_response
from django.http import HttpResponse
from django.template import RequestContext
from django.core.serializers.json import DjangoJSONEncoder
from django.core.cache import cache
from clean_india.models import SpotFix, SpotFixImages, JoinedSpotFix
from django.core.files.base import ContentFile
import math
import json
import datetime
from Auth.models import UserProfile
from django.db.models import F
from django.contrib.auth.decorators import login_required
from clean_india.email import *
import threading
from django.core.mail import EmailMultiAlternatives
import settings


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
        min_required = request.POST['min_required'] if 'min_required' in request.POST else 1
      
        userprofile = UserProfile.objects.get(id = request.user.id)
        userprofile.phone_num = phone_num
        userprofile.spotfix_created = userprofile.spotfix_created + 1
        userprofile.save()
 
        new_spotfix = SpotFix(**{
            'name': request.POST['title'] if 'title' in request.POST else '',
            'starttime': starttime,
            'description': description,
            'address': address,
            'latitude': latitude,
            'longitude': longitude,
            'user_id': request.user.id,
            'min_required': min_required
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
                        new_coordinates.lat_max, latitude__gte = \
                        new_coordinates.lat_min, longitude__lte = \
                        new_coordinates.lon_max, longitude__gte = \
                        new_coordinates.lon_min).values('address', \
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

def spotfix_join_page(request, spotfix_id):
    return render_to_response('spotfix_page.jade',
      {'spotfix_id': spotfix_id}, 
      context_instance=RequestContext(request))

def get_spotfix_details(request):
    spotfix_id = int(request.GET['sf_id'])
    spotfix_list = list(SpotFix.objects.filter(id = spotfix_id).values('address', \
                        'description', 'starttime', 'participate_no', 'name',\
                        'min_required', 'user__first_name', 'user__last_name',\
                        'user__phone_num', 'id', 'latitude', 'longitude',\
                        'status', 'endtime', 'reported_user__id', 'reported_user__first_name',\
                        'reported_user__last_name'))
    spotfix_ids = [int(c['id']) for c in spotfix_list]
    spotfix_images = SpotFixImages.objects.filter(spotfix__in = spotfix_ids).values()
    image_dict = {}
    for img in spotfix_images:
        image_dict.setdefault(img['spotfix_id'], []).append([img['image'], img['state']])

    participants = list(JoinedSpotFix.objects.filter(spotfix_id = spotfix_id).values('user__first_name',\
       'user__last_name', 'user_id', 'user__phone_num', 'user__profile_image', 'initiator'))
    return HttpResponse(json.dumps({
        'status': 1,
        'spotfix_details': spotfix_list[0] if len(spotfix_list) else [],
        'image_dict': image_dict,
        'plist': participants
    }, cls=DjangoJSONEncoder))


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
        user.userprofile.spotfix_attended = user.userprofile.spotfix_attended + 1
        user.userprofile.save()

        new_spotfix = SpotFix.objects.get(id = spotfix_id)
        new_spotfix.participate_no = new_spotfix.participate_no + 1
        new_spotfix.save()
        t1 = threading.Thread(target=send_requiremnt_mail, args = (\
            request.user.first_name, \
            request.user.email,\
            datetime.datetime.strftime(new_spotfix.starttime, '%Y-%m-%d %H:%M'),\
            new_spotfix.address,\
            'http://maps.google.com/?q='+ str(new_spotfix.latitude) +',' + str(new_spotfix.longitude),\
            new_spotfix.joinedspotfix_set.filter(initiator= True)[0].user.first_name,\
            new_spotfix.joinedspotfix_set.filter(initiator= True)[0].user.phone_num,\
            new_spotfix.name, new_spotfix.id))
        t1.start()
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



def created_spotfix_page(request, user_id):
    return render_to_response('created_spotfix.jade',
        {'user_id': user_id},
        context_instance=RequestContext(request))
    
def get_created_spotfix_by_user(request):
    try:
        user_id = int(request.GET['user_id'])
        spotfix_list = list(SpotFix.objects.filter(user_id = user_id).values('address', \
                        'description', 'starttime', 'participate_no',\
                        'min_required', 'user__first_name', 'user__last_name',\
                        'user__phone_num', 'id', 'latitude', 'longitude',\
                        'status', 'endtime').order_by('-starttime'))
        return HttpResponse(json.dumps(
            {'locations': spotfix_list, 'status': 1},
            cls=DjangoJSONEncoder))   
    except Exception, e:
        return HttpResponse(json.dumps(
            {'locations': [], 'status': 0},
            cls=DjangoJSONEncoder)) 


def joined_spotfix_page(request, user_id):
    return render_to_response('joined_spotfix.jade',
        {'user_id': user_id},
        context_instance=RequestContext(request))
    
def get_joined_spotfix_by_user(request):
    try:
        user_id = int(request.GET['user_id'])
        spotfix_list = list(JoinedSpotFix.objects.filter(user_id = user_id).order_by('-spotfix__starttime'))
        final_list = []
        for spot in spotfix_list:
          final_list.append({
              'address': spot.spotfix.address,
              'description': spot.spotfix.description,
              'starttime': spot.spotfix.starttime, 
              'participate_no': spot.spotfix.participate_no,
              'min_required': spot.spotfix.min_required, 
              'user__first_name': spot.user.first_name, 
              'user__last_name': spot.user.last_name,
              'user__phone_num': spot.user.phone_num, 
              'id': spot.spotfix_id, 
              'latitude': spot.spotfix.latitude, 
              'longitude': spot.spotfix.longitude,
              'status': spot.spotfix.status, 
              'endtime': spot.spotfix.endtime,
              'created_on': spot.joined_on
          })
        print final_list 
        return HttpResponse(json.dumps(
            {'locations': final_list, 'status': 1},
            cls=DjangoJSONEncoder))   
    except Exception, e:
        print str(e)
        return HttpResponse(json.dumps(
            {'locations': [], 'status': 0},
            cls=DjangoJSONEncoder)) 


class BoundingBox(object):
    def __init__(self, *args, **kwargs):
        self.lat_min = None
        self.lon_min = None
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

    lat_min = lat - half_side_in_km/radius
    lat_max = lat + half_side_in_km/parallel_radius
    lon_min = lon - half_side_in_km/parallel_radius
    lon_max = lon + half_side_in_km/parallel_radius
    rad2deg = math.degrees

    box = BoundingBox()
    box.lat_min = rad2deg(lat_min)
    box.lon_min = rad2deg(lon_min)
    box.lat_max = rad2deg(lat_max)
    box.lon_max = rad2deg(lon_max)
    return (box)

def profile_page(request, user_id):
    user_data = list(UserProfile.objects.filter(id = user_id).values())
    return render_to_response('profile_page.jade',
        {'udata': user_data[0] if len(user_data) else []},
        context_instance=RequestContext(request))


@login_required
def report_spotfix_page(request, spotfix_id):
    
    return render_to_response('report_spotfix_page.jade',
        {'spotfix_id': spotfix_id},
        context_instance=RequestContext(request))

def report_spotfix(request):
    spotfix_id = request.POST['sf_id']
    rsf = SpotFix.objects.get(id = spotfix_id)
    rsf.status = 'C'
    rsf.reported_user_id = request.user.id
    rsf.endtime = request.POST['endtime']   
    rsf.save()
    print request.POST
    print request.FILES.getlist('spotfix_image')
    for spot_image in request.FILES.getlist('spotfix_image'):
        content_file = ContentFile(spot_image.read())
        new_spot_image = SpotFixImages()
        new_spot_image.spotfix = rsf
        new_spot_image.state = 'A'
        new_spot_image.image.save(spot_image.name, content_file)
        new_spot_image.save()
    return HttpResponse(json.dumps({
        'status': 1
    }))


def spotfix_image_gallery(request, spotfix_id):
    return render_to_response('spotfix_gallery.jade',
        {'spotfix_id': spotfix_id},
        context_instance=RequestContext(request))
    
def get_spotfix_image(request):
    spotfix_id = request.GET['sf_id']
    images = list(SpotFixImages.objects.filter(spotfix_id = spotfix_id).values().order_by('uploaded_on'))
    return HttpResponse(json.dumps({
        'status': 1,
        'image_list': images
    }, cls=DjangoJSONEncoder))


def send_requiremnt_mail(name, email, starttime, address, gmap_link, cname, cphone, title, spotfixid):
    mail_type = "joined"
    if mail_type == 'joined':
        subject, from_email, to = 'Clean India: Spotfix Joining Confirmation', email, settings.EMAIL_HOST_USER
        html_content = """Dear %s,<br>
              <p>Greetings from Clean India!!</p>
              <p>Thanks for being a part of this cause, by volunteering a spot fix.</p>
              <p>Here are the details for your opted SpotFix:-</p>
              SpotFix Title: %s<br>
              SpotFix Date and Time: %s<br>
              Spot Fix Address: %s<br>
              Map Location: <a href="%s">Google map link</a><br>
              <p>Click <a href="http://tajinderpalsingh.com/spotfix/join/%s">here</a> to invite your friends to join this spot fix.</p>
              <p>Kindly get along whatever you may think will be required to make the spot a better<br>
place (paint, shovels, gloves, paper bags, paint brushes, buckets, etc) .<br>
You may contact "%s" at %s, the initiator of the spot fix for coordination.</p><br>
              <p>For a cleaner India! Bharat Mata ki Jai!!</p><br><br>
              Kind Regards,<br>Clean India Team<br>http://tajinderpalsingh.com
           """%(name, title, starttime, address, gmap_link, spotfixid, cname, cphone)
        html_content = main_html1 + html_content + main_html2
        msg = EmailMultiAlternatives(subject, '', from_email, [settings.EMAIL_HOST_USER])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

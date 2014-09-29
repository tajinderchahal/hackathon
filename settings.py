"""
Django settings for clickmyday project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'swachbharat2014@gmail.com'
EMAIL_HOST_PASSWORD = 'tajinder@cleanindia'
EMAIL_PORT = 587

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

SITE_URL = "http://tajinderpalsingh.com"
#SITE_URL = "http://cleanindia.com"
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '&92w)=542)0f5qx!iq&!8s$u5fg3h2p0b4b4qagv($c*2*g3i+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
#ALLOWED_HOSTS = ['.clickmyday.com',]

TEMPLATE_DEBUG = True

TEMPLATE_DIRS = (
    BASE_DIR + '/clean_india/templates/',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
    'django.contrib.auth.context_processors.auth'
)
TEMPLATE_LOADERS = (
    ('pyjade.ext.django.Loader',(
           'django.template.loaders.filesystem.Loader',
           'django.template.loaders.app_directories.Loader',
    )),
)


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'clean_india',
    'Auth',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'urls'

#WSGI_APPLICATION = 'api_docs.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'clean_india',
        'USER': 'clean_indian',
        'PASSWORD': 'clean_india',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    },
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'

STATICFILES_DIRS = (
    os.getcwd(),
)

# ======== TESTING =======
GOOGLE_CLIENT_ID = '299708147881-fpmajgj8tbhvn8ngmngkfss7ol92sf5u.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'LJ-4muvJ3VIHIoECBU4FR6on'

FACEBOOK_APP_ID = '295847137276883'
FACEBOOK_APP_SECRET = 'd3686142603562b7d7adff4bb40b2c22'
FACEBOOK_APP_SCOPE = 'email'


CACHE_TIME_TO_LIVE = 2592000

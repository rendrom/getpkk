from django.contrib.gis import admin

from .models import Pkk, Geom, Usage

admin.site.register(Pkk)
admin.site.register(Geom)
admin.site.register(Usage)

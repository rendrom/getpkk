from django.contrib.gis import admin

from .models import Pkk, Geom, Usage


@admin.register(Usage)
class UsageAdmin(admin.ModelAdmin):
    list_display = ('geom', 'create_date', 'user')
    list_filter = ('create_date', 'user')


admin.site.register(Pkk)
admin.site.register(Geom)


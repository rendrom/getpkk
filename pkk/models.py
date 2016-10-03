# coding=utf8
from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.utils.encoding import python_2_unicode_compatible
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.utils import timezone


@python_2_unicode_compatible
class Pkk (models.Model):
    code = models.CharField('Номер', max_length=50, unique=True)
    area_type = models.IntegerField('Тип участка', default=1)
    attrs = JSONField(blank=True, null=True)

    extent = JSONField(blank=True, null=True)
    image_extent = JSONField(blank=True, null=True)
    center = JSONField('цент', blank=True, null=True)
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)

    create_date = models.DateTimeField('Дата создания', default=timezone.now)
    change_date = models.DateTimeField('Дата обновления', default=timezone.now)
    image = models.ImageField('Изображение', upload_to='pkk', blank=True, null=True)

    lon = models.FloatField('Долгота', blank=True, null=True)
    lat = models.FloatField('Широта', blank=True, null=True)

    def __str__(self):
        return self.code
    
    class Meta:
        verbose_name = 'Участок'
        verbose_name_plural = 'Участки'


@python_2_unicode_compatible
class Geom (models.Model):
    code = models.ForeignKey(Pkk, related_name="geoms")
    epsilon = models.FloatField('Точность аппроксимации')

    geom = models.MultiPolygonField('Геометрия', null=True, blank=True)

    def __str__(self):
        return '%s/%s' % (self.code.area_type, self.code)

    class Meta:
        unique_together = ("code", "epsilon")
        verbose_name = 'Геометрия участка'
        verbose_name_plural = 'Варианты геометрии участка'


@python_2_unicode_compatible
class Usage (models.Model):
    user = models.ForeignKey(User, blank=True, null=True)
    create_date = models.DateTimeField('Дата создания', default=timezone.now)
    geom = models.ForeignKey(Geom)

    def __str__(self):
        return '%s' % self.geom

    class Meta:
        verbose_name = 'Запрос участка'
        verbose_name_plural = 'Запросы участков'
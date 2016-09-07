# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-07 04:43
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.gis.db.models.fields
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Geom',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('epsilon', models.FloatField(verbose_name='\u0422\u043e\u0447\u043d\u043e\u0441\u0442\u044c \u0430\u043f\u043f\u0440\u043e\u043a\u0441\u0438\u043c\u0430\u0446\u0438\u0438')),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(blank=True, null=True, srid=4326, verbose_name='\u0413\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u044f')),
            ],
            options={
                'verbose_name': '\u0413\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u044f \u0443\u0447\u0430\u0441\u0442\u043a\u0430',
                'verbose_name_plural': '\u0412\u0430\u0440\u0438\u0430\u043d\u0442\u044b \u0433\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u0438 \u0443\u0447\u0430\u0441\u0442\u043a\u0430',
            },
        ),
        migrations.CreateModel(
            name='Pkk',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50, unique=True, verbose_name='\u041d\u043e\u043c\u0435\u0440')),
                ('attrs', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('extent', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('image_extent', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('center', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True, verbose_name='\u0446\u0435\u043d\u0442')),
                ('width', models.IntegerField(blank=True, null=True)),
                ('height', models.IntegerField(blank=True, null=True)),
                ('create_date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='\u0414\u0430\u0442\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044f')),
                ('change_date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='\u0414\u0430\u0442\u0430 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f')),
                ('image', models.ImageField(blank=True, null=True, upload_to='pkk', verbose_name='\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435')),
                ('lon', models.FloatField(blank=True, null=True, verbose_name='\u0414\u043e\u043b\u0433\u043e\u0442\u0430')),
                ('lat', models.FloatField(blank=True, null=True, verbose_name='\u0428\u0438\u0440\u043e\u0442\u0430')),
            ],
            options={
                'verbose_name': '\u0423\u0447\u0430\u0441\u0442\u043e\u043a',
                'verbose_name_plural': '\u0423\u0447\u0430\u0441\u0442\u043a\u0438',
            },
        ),
        migrations.CreateModel(
            name='Usage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='\u0414\u0430\u0442\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044f')),
                ('geom', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pkk.Geom')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '\u0417\u0430\u043f\u0440\u043e\u0441 \u0443\u0447\u0430\u0441\u0442\u043a\u0430',
                'verbose_name_plural': '\u0417\u0430\u043f\u0440\u043e\u0441\u044b \u0443\u0447\u0430\u0441\u0442\u043a\u043e\u0432',
            },
        ),
        migrations.AddField(
            model_name='geom',
            name='code',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='geoms', to='pkk.Pkk'),
        ),
        migrations.AlterUniqueTogether(
            name='geom',
            unique_together=set([('code', 'epsilon')]),
        ),
    ]

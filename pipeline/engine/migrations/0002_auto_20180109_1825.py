# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-01-09 18:25
from __future__ import unicode_literals

from django.db import migrations
import pipeline.engine.models


class Migration(migrations.Migration):

    dependencies = [
        ('engine', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='processsnapshot',
            name='data',
            field=pipeline.engine.models.IOField(verbose_name='pipeline \u8fd0\u884c\u65f6\u6570\u636e'),
        ),
    ]
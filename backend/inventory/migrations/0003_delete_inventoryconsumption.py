# Generated by Django 5.1.4 on 2025-01-09 20:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0002_inventoryconsumption'),
    ]

    operations = [
        migrations.DeleteModel(
            name='InventoryConsumption',
        ),
    ]

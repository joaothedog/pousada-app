# Generated by Django 5.1.4 on 2025-01-09 19:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0002_alter_reservation_payment_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='extra_charges',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]

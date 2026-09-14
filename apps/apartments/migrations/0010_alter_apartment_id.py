import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apartments', '0009_alter_apartment_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apartment',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]

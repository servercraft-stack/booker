import uuid
from django.db import migrations, models


def forwards(apps, schema_editor):
    """Convert apartments_apartment.id from bigint to uuid."""
    related_tables = [
        ('apartments_apartmentpricing', 'apartment_id'),
        ('apartments_apartmentaddress', 'apartment_id'),
        ('apartments_apartmentavailability', 'apartment_id'),
        ('apartments_apartmentrule', 'apartment_id'),
        ('apartments_apartment_amenities', 'apartment_id'),
        ('apartments_apartmentimage', 'apartment_id'),
        ('bookings_booking', 'apartment_id'),
        ('reviews_review', 'apartment_id'),
    ]

    with schema_editor.connection.cursor() as cursor:
        def table_exists(table_name):
            cursor.execute(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = %s)",
                [table_name],
            )
            return cursor.fetchone()[0]

        # 1. Drop FK constraints pointing to apartments_apartment
        for table, col in related_tables:
            if not table_exists(table):
                continue
            cursor.execute(
                "SELECT conname FROM pg_constraint "
                "WHERE conrelid = %s::regclass AND confrelid = 'apartments_apartment'::regclass",
                [table],
            )
            for row in cursor.fetchall():
                cursor.execute(f'ALTER TABLE {table} DROP CONSTRAINT {row[0]}')

        # 2. Add a temporary UUID column to apartments_apartment
        cursor.execute(
            "ALTER TABLE apartments_apartment "
            "ADD COLUMN uuid_temp uuid DEFAULT gen_random_uuid() NOT NULL"
        )

        # 3. Populate the temp UUID column for existing rows
        cursor.execute(
            "UPDATE apartments_apartment SET uuid_temp = gen_random_uuid()"
        )

        # 4. For each related table, add a UUID column, populate, drop old, rename
        for table, col in related_tables:
            if not table_exists(table):
                continue
            cursor.execute(f'ALTER TABLE {table} ADD COLUMN {col}_uuid uuid')
            cursor.execute(
                f'UPDATE {table} SET {col}_uuid = a.uuid_temp '
                f'FROM apartments_apartment a WHERE {table}.{col} = a.id'
            )
            cursor.execute(f'ALTER TABLE {table} DROP COLUMN {col}')
            cursor.execute(f'ALTER TABLE {table} RENAME COLUMN {col}_uuid TO {col}')

        # 5. Drop old bigint id, rename uuid_temp to id
        cursor.execute('ALTER TABLE apartments_apartment DROP COLUMN id')
        cursor.execute('ALTER TABLE apartments_apartment RENAME COLUMN uuid_temp TO id')

        # 6. Make id the primary key
        cursor.execute('ALTER TABLE apartments_apartment ADD PRIMARY KEY (id)')

        # 7. Recreate FK constraints
        for table, col in related_tables:
            if not table_exists(table):
                continue
            cursor.execute(
                f'ALTER TABLE {table} '
                f'ADD CONSTRAINT {table}_{col}_fkey '
                f'FOREIGN KEY ({col}) REFERENCES apartments_apartment(id) ON DELETE CASCADE'
            )


def backwards(apps, schema_editor):
    """Reverse is not supported for this migration."""
    raise migrations.irreversible(
        'Converting UUID back to bigint is not supported. '
        'Use a new migration to revert.'
    )


class Migration(migrations.Migration):

    dependencies = [
        ('apartments', '0009_alter_apartment_image'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name='apartment',
                    name='id',
                    field=models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
            ],
            database_operations=[
                migrations.RunPython(forwards, backwards),
            ],
        ),
    ]

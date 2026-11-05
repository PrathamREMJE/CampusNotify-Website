from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a College Admin user (Professional ERP approach)'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Admin username')
        parser.add_argument('--email', type=str, required=True, help='Admin email')
        parser.add_argument('--password', type=str, required=True, help='Admin password')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        try:
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with username "{username}" already exists')
                )
                return

            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with email "{email}" already exists')
                )
                return

            # Create College Admin (NOT Django superuser)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='admin',  # College Admin role
                is_active=True,
                is_verified=True,
                profile_completed=True,
                is_superuser=False,  # Not a Django superuser
                is_staff=False       # Not Django admin staff
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ College Admin created successfully!\n'
                    f'Username: {username}\n'
                    f'Email: {email}\n'
                    f'Role: College Admin\n'
                    f'Status: Active & Verified'
                )
            )

        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {e}')
            )
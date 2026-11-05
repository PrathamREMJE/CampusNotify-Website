from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import CustomUser, College

class Command(BaseCommand):
    help = 'Create test users with different statuses'

    def handle(self, *args, **options):
        # Get the first college (or create one if none exists)
        college = College.objects.first()
        if not college:
            self.stdout.write(self.style.ERROR('No college found. Please create a college first.'))
            return

        # Create test users
        test_users = [
            {
                'username': 'john_teacher',
                'first_name': 'John',
                'email': 'john@example.com',
                'phone': '+91 98765 43210',
                'role': 'teacher',
                'department': 'Computer Science',
                'is_active': True
            },
            {
                'username': 'jane_hod',
                'first_name': 'Jane',
                'email': 'jane@example.com',
                'phone': '+91 98765 43211',
                'role': 'hod',
                'department': 'Mathematics',
                'is_active': False  # Inactive user
            },
            {
                'username': 'bob_teacher',
                'first_name': 'Bob',
                'email': 'bob@example.com',
                'phone': '+91 98765 43212',
                'role': 'teacher',
                'department': 'Physics',
                'is_active': True
            },
            {
                'username': 'alice_clerk',
                'first_name': 'Alice',
                'email': 'alice@example.com',
                'phone': '+91 98765 43213',
                'role': 'senior_clerk',
                'department': 'Administration',
                'is_active': False  # Inactive user
            },
            {
                'username': 'mike_principal',
                'first_name': 'Mike',
                'email': 'mike@example.com',
                'phone': '+91 98765 43214',
                'role': 'principal',
                'department': 'Administration',
                'is_active': True
            }
        ]

        created_count = 0
        for user_data in test_users:
            username = user_data['username']
            
            # Check if user already exists
            if CustomUser.objects.filter(username=username).exists():
                self.stdout.write(f'User {username} already exists, skipping...')
                continue
            
            # Create user
            user = CustomUser.objects.create(
                username=username,
                first_name=user_data['first_name'],
                email=user_data['email'],
                phone=user_data['phone'],
                role=user_data['role'],
                department=user_data['department'],
                college=college,
                password=make_password('password123'),  # Default password
                is_active=user_data['is_active'],
                is_staff=False,
                is_superuser=False
            )
            
            status = "Active" if user.is_active else "Inactive"
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created {status} user: {username} ({user_data["first_name"]}) - {user_data["role"]}'
                )
            )
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} test users!')
        )
        self.stdout.write('Default password for all test users: password123')
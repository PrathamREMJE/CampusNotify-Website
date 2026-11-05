from django.core.management.base import BaseCommand
from core.models import Department, Committee

class Command(BaseCommand):
    help = 'Create test departments and committees'

    def handle(self, *args, **options):
        # Create test departments
        departments = [
            'Computer Science',
            'Information Technology',
            'Electronics and Communication',
            'Mechanical Engineering',
            'Civil Engineering',
            'Mathematics',
            'Physics',
            'Chemistry',
            'English',
            'Commerce'
        ]

        for dept_name in departments:
            department, created = Department.objects.get_or_create(name=dept_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created department: {dept_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Department already exists: {dept_name}')
                )

        # Create test committees
        committees = [
            'Academic Committee',
            'Examination Committee',
            'Library Committee',
            'Sports Committee',
            'Cultural Committee',
            'Discipline Committee',
            'Placement Committee',
            'Research Committee',
            'Student Welfare Committee',
            'Anti-Ragging Committee'
        ]

        for committee_name in committees:
            committee, created = Committee.objects.get_or_create(name=committee_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created committee: {committee_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Committee already exists: {committee_name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Test data creation completed!')
        )
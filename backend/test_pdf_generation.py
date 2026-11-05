#!/usr/bin/env python3
"""
Test script to check PDF generation with proper alignment
"""
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.utils import generate_pdf_for_notice
from django.conf import settings

def test_custom_exam_notice_pdf():
    """Test custom exam schedule notice PDF generation"""
    print("Testing Custom Exam Schedule Notice PDF Generation...")
    
    # Sample data matching the image
    test_data = {
        "language": "english",
        "notice_date": "24/07/2025",
        "target_groups": ["SY and TY"],
        "target_departments": ["BBA", "BCA", "B.Com", "BBA(IB)", "BBA(CA)", "B.Com(CA)", "B.Sc.(CS)", "B.Sc.(IT)"],
        "ordered_blocks": [
            {
                "type": "introduction",
                "text": "All the Second Year & TY BBA, BCA, B.Com, BBA(IB), BBA(CA), B.Com(CA), B.Sc.(CS), B.Sc.(IT) students are hereby informed that the University of Pune has declared the exam schedules for the above mentioned courses. The detailed schedules are as follows:"
            },
            {
                "type": "table",
                "rows": [
                    ["Course", "Date", "Time"],
                    ["SY BBA", "30th July 2025", "10:00 AM - 1:00 PM"],
                    ["TY BBA", "31st July 2025", "10:00 AM - 1:00 PM"],
                    ["SY BCA", "Thursday 31st July 2025", "2:00 PM - 5:00 PM"],
                    ["TY BCA", "1st Aug 2025", "10:00 AM - 1:00 PM"],
                    ["SY B.Com", "2nd Aug 2025", "2:00 PM - 5:00 PM"],
                    ["TY B.Com", "3rd Aug 2025", "10:00 AM - 1:00 PM"],
                    ["SY BBA(IB)", "4th Aug 2025", "10:00 AM - 1:00 PM"],
                    ["TY BBA(IB)", "5th Aug 2025", "2:00 PM - 5:00 PM"],
                    ["SY BBA(CA)", "6th Aug 2025", "10:00 AM - 1:00 PM"],
                    ["TY BBA(CA)", "7th Aug 2025", "2:00 PM - 5:00 PM"],
                    ["SY B.Com(CA)", "8th Aug 2025", "10:00 AM - 1:00 PM"],
                    ["TY B.Com(CA)", "9th Aug 2025", "2:00 PM - 5:00 PM"],
                    ["SY B.Sc.(CS)", "10th Aug 2025", "10:00 AM - 1:00 PM"],
                    ["TY B.Sc.(CS)", "11th Aug 2025", "2:00 PM - 5:00 PM"],
                    ["SY B.Sc.(IT)", "12th Aug 2025", "10:00 AM - 1:00 PM"],
                    ["TY B.Sc.(IT)", "13th Aug 2025", "2:00 PM - 5:00 PM"]
                ]
            },
            {
                "type": "instructions",
                "items": [
                    "The exam will be held in the college premises only. No separate hall ticket information on",
                    "Use the question paper does not allow any written or printed to avoid",
                    "Students must carry their ID cards at the time of examination.",
                    "Students must be present at the given schedule."
                ]
            },
            {
                "type": "signatures",
                "items": [
                    {
                        "person_name": "Dr. Sneha Rane",
                        "role": "Controller of Examinations"
                    },
                    {
                        "person_name": "Dr. Anjali Joshi",
                        "role": "Vice Principal"
                    },
                    {
                        "person_name": "Dr. Lopa Desai",
                        "role": "Principal"
                    }
                ]
            }
        ],
        "apply_footer": True
    }
    
    try:
        # Generate PDF
        relative_path, pdf_url = generate_pdf_for_notice('custom', test_data)
        
        # Check if PDF was created
        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
            print(f"✅ PDF generated successfully!")
            print(f"📁 File path: {full_path}")
            print(f"📊 File size: {file_size} bytes")
            print(f"🔗 URL: {pdf_url}")
            
            # Check if file is not empty
            if file_size > 1000:  # At least 1KB
                print("✅ PDF file appears to have content")
            else:
                print("⚠️ PDF file seems too small, might be corrupted")
                
        else:
            print("❌ PDF file was not created")
            
    except Exception as e:
        print(f"❌ Error generating PDF: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_custom_exam_notice_pdf()

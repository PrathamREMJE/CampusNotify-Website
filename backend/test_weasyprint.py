#!/usr/bin/env python3
"""
WeasyPrint PDF Generation Test Script for Windows
This script tests WeasyPrint functionality and diagnoses common issues.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from django.conf import settings

def test_basic_pdf():
    """Test basic PDF generation"""
    print("=== Testing Basic PDF Generation ===")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Test PDF</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                font-size: 14px;
            }
            h1 { color: #003366; text-align: center; }
            .content { margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>WeasyPrint Test Document</h1>
        <div class="content">
            <p>This is a test document to verify WeasyPrint functionality.</p>
            <p><strong>Date:</strong> 2025-01-24</p>
            <p><strong>Status:</strong> Testing</p>
        </div>
        <div style="margin-top: 50px; text-align: right;">
            <p>MES GCC College</p>
        </div>
    </body>
    </html>
    """
    
    try:
        # Test with Arial (system font)
        output_path = "test_basic.pdf"
        HTML(string=html_content).write_pdf(output_path)
        
        # Check if file was created and has content
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ Basic PDF created successfully: {output_path} ({file_size} bytes)")
            return True
        else:
            print("❌ PDF file was not created")
            return False
            
    except Exception as e:
        print(f"❌ Basic PDF generation failed: {e}")
        return False

def test_dejavu_font():
    """Test with DejaVu Sans font"""
    print("\n=== Testing DejaVu Sans Font ===")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>DejaVu Font Test</title>
        <style>
            body { 
                font-family: 'DejaVu Sans', sans-serif; 
                margin: 20px;
                font-size: 14px;
            }
            h1 { color: #003366; text-align: center; }
        </style>
    </head>
    <body>
        <h1>DejaVu Sans Font Test</h1>
        <p>This text should render in DejaVu Sans font.</p>
        <p>Special characters: àáâãäåæçèéêë</p>
    </body>
    </html>
    """
    
    try:
        output_path = "test_dejavu.pdf"
        HTML(string=html_content).write_pdf(output_path)
        
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ DejaVu font PDF created: {output_path} ({file_size} bytes)")
            return True
        else:
            print("❌ DejaVu font PDF was not created")
            return False
            
    except Exception as e:
        print(f"❌ DejaVu font PDF generation failed: {e}")
        return False

def test_django_template():
    """Test with actual Django template"""
    print("\n=== Testing Django Template Rendering ===")
    
    try:
        from django.template.loader import render_to_string
        
        # Test data similar to your notice
        test_data = {
            'title': 'Test Holiday Notice',
            'date': '2025-01-24',
            'reason': 'Testing WeasyPrint functionality',
            'language': 'English'
        }
        
        # Render the actual template
        html_string = render_to_string('notices/holiday_notice.html', {'notice': test_data})
        print("✅ Django template rendered successfully")
        print(f"HTML length: {len(html_string)} characters")
        
        # Generate PDF
        output_path = "test_django_template.pdf"
        HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf(output_path)
        
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ Django template PDF created: {output_path} ({file_size} bytes)")
            return True
        else:
            print("❌ Django template PDF was not created")
            return False
            
    except Exception as e:
        print(f"❌ Django template PDF generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_font_configuration():
    """Test font configuration and availability"""
    print("\n=== Testing Font Configuration ===")
    
    try:
        font_config = FontConfiguration()
        print("✅ Font configuration created successfully")
        
        # Test with explicit font configuration
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'DejaVu Sans', Arial, sans-serif; }
                h1 { font-family: 'DejaVu Sans', Arial, sans-serif; }
            </style>
        </head>
        <body>
            <h1>Font Configuration Test</h1>
            <p>Testing font fallback: DejaVu Sans → Arial → sans-serif</p>
        </body>
        </html>
        """
        
        output_path = "test_font_config.pdf"
        HTML(string=html_content).write_pdf(output_path, font_config=font_config)
        
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ Font config PDF created: {output_path} ({file_size} bytes)")
            return True
        else:
            print("❌ Font config PDF was not created")
            return False
            
    except Exception as e:
        print(f"❌ Font configuration test failed: {e}")
        return False

def check_system_info():
    """Check system and WeasyPrint information"""
    print("=== System Information ===")
    print(f"Python version: {sys.version}")
    print(f"Operating System: {os.name}")
    print(f"Platform: {sys.platform}")
    
    try:
        import weasyprint
        print(f"WeasyPrint version: {weasyprint.__version__}")
    except:
        print("❌ Could not get WeasyPrint version")
    
    try:
        import cairo
        print(f"Cairo available: Yes")
    except ImportError:
        print("Cairo available: No")
    
    try:
        import gi
        print(f"GObject Introspection available: Yes")
    except ImportError:
        print("GObject Introspection available: No")

def main():
    """Run all tests"""
    print("WeasyPrint Diagnostic Tool for Windows")
    print("=" * 50)
    
    # Change to backend directory
    os.chdir(Path(__file__).parent)
    
    check_system_info()
    print()
    
    tests = [
        test_basic_pdf,
        test_dejavu_font,
        test_font_configuration,
        test_django_template
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    
    test_names = [
        "Basic PDF Generation",
        "DejaVu Font Test", 
        "Font Configuration",
        "Django Template"
    ]
    
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
    
    if all(results):
        print("\n🎉 All tests passed! WeasyPrint is working correctly.")
    else:
        print(f"\n⚠️  {results.count(False)} test(s) failed. Check the output above for details.")

if __name__ == "__main__":
    main()
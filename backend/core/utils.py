from .models import ActivityLog, Department
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.conf import settings
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import tempfile
import os
import uuid
import json
import logging
from datetime import datetime
from .translations import HOLIDAY_NAME_TRANSLATIONS
from django.contrib.auth import get_user_model


# Set up logging for WeasyPrint
logging.getLogger('weasyprint').setLevel(logging.ERROR)


def convert_to_devanagari_numerals(s):
    devnagari_digits = {
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    }
    return ''.join(devnagari_digits.get(ch, ch) for ch in str(s))



def format_marathi_date(date_str):
    weekdays = ["सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"]
    months = ["", "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"]

    dt = datetime.strptime(date_str, "%Y-%m-%d")
    weekday = weekdays[dt.weekday()]
    day = convert_to_devanagari_numerals(dt.day)
    month = months[dt.month]
    year = convert_to_devanagari_numerals(dt.year)

    return f"{weekday}, दिनांक {day} {month} {year}"




def log_activity(user, action, description, target_user=None, request=None):
    """
    Log user activity for audit trail
    
    Args:
        user: The user performing the action
        action: Action type from ActivityLog.ACTION_CHOICES
        description: Human readable description of the action
        target_user: User being acted upon (optional)
        request: HTTP request object to get IP and user agent (optional)
    """
    ip_address = None
    user_agent = None
    
    if request:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    ActivityLog.objects.create(
        user=user,
        action=action,
        target_user=target_user,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent
    )

def get_user_activities(user, limit=50):
    """Get recent activities for a user"""
    return ActivityLog.objects.filter(user=user)[:limit]

def get_all_activities(limit=100):
    """Get recent activities for all users (admin view)"""
    return ActivityLog.objects.all()[:limit]




def generate_pdf_for_notice(notice_type, data, preview=False, user=None):
    """
    Generate PDF for a notice type by merging all content fields and
    applying translations/formatting.
    If preview=True, returns HTML string instead of PDF.
    """
    """
    Generate PDF for a notice type by merging all content fields and 
    applying translations/formatting.
    """
    template_name = ""
    
    # Merge all fields into one dictionary for the template
    # This ensures both root-level keys and content_data keys are included
    content_data = data.get("content_data", {})
    merged_data = {**content_data, **{k: v for k, v in data.items() if k != "content_data"}}
    
    # Preserve the original content_data structure for template access
    merged_data["content_data"] = content_data

    # Fetch dynamic letterhead if user is provided
    letterhead_html = ""
    footer_html = ""
    if user and user.college:
        from .models import Letterhead
        letterhead = Letterhead.objects.filter(college=user.college).order_by('-updated_at').first()
        if letterhead:
            letterhead_html = letterhead.html_content
            footer_html = letterhead.footer_html if hasattr(letterhead, "footer_html") else ""
    merged_data["letterhead_html"] = letterhead_html
    merged_data["footer_html"] = footer_html

    # Language handling
    language = merged_data.get("language", "english").lower()

    principal_names = {
        "english": "(Dr. Kishor Desarda)",
        "marathi": "(डॉ. किशोर देसरडा)",
        "hindi": "(डॉ. किशोर देसरडा)"
    }

    principal_designations = {
        "english": "Principal",
        "marathi": "प्राचार्य",
        "hindi": "प्राचार्य"
    }

    footer_name = principal_names.get(language, "(Dr. Kishor Desarda)")
    footer_title = principal_designations.get(language, "Principal")
    merged_data["footer_name"] = footer_name
    merged_data["footer_title"] = footer_title
    merged_data["content_data"]["footer_name"] = footer_name
    merged_data["content_data"]["footer_title"] = footer_title
    # --- Resolve person IDs in signatures to names (and support custom names) ---
    User = get_user_model()

    def resolve_signatures(signatures):
        resolved = []
        for sig in signatures:
            role = sig.get("role", "")
            person_id = sig.get("person")
            person_name = sig.get("person_name", "")
            if not person_name and person_id:
                try:
                    # Ensure person_id is an integer
                    if isinstance(person_id, str):
                        try:
                            person_id = int(person_id)
                        except ValueError:
                            # If it's not a valid integer, treat as custom name
                            person_name = str(person_id)
                            person_id = None
                    if person_id:
                        person_obj = User.objects.get(id=person_id)
                        full_name = f"{person_obj.first_name} {person_obj.last_name}".strip()
                        person_name = full_name if full_name else person_obj.username
                except User.DoesNotExist:
                    person_name = str(person_id)
            resolved.append({
                "role": role,
                "person": person_id,
                "person_name": person_name,
                "custom_role": sig.get("custom_role", "")
            })
        return resolved

    # Handle both root-level and content_data signatures
    signatures_root = merged_data.get("signatures", [])
    signatures_content = merged_data.get("content_data", {}).get("signatures", [])

    resolved = resolve_signatures(signatures_root or signatures_content)

    merged_data["signatures"] = resolved
    merged_data["content_data"]["signatures"] = resolved



    if notice_type == "holiday":
        template_name = "notices/holiday_notice.html"
        if(language != "english"):
            holiday_title = merged_data.get("holiday_title", "").strip().lower()
        else:
            holiday_title = merged_data.get("holiday_title", "").strip()
        translated_title = HOLIDAY_NAME_TRANSLATIONS.get(holiday_title, {}).get(language, holiday_title)
        merged_data["translated_holiday_title"] = translated_title
        merged_data["content_data"]["translated_holiday_title"] = translated_title

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        

        holiday_date = merged_data.get("holiday_date")
        if holiday_date:
            if language == "marathi":
                formatted_date = format_marathi_date(holiday_date)
                merged_data["formatted_date"] = formatted_date
                merged_data["marathi_date"] = formatted_date
            elif language == "hindi":
                formatted_date = convert_to_devanagari_numerals(holiday_date)
                merged_data["formatted_date"] = formatted_date
            else:  # English or other languages
                try:
                    holiday_date_obj = datetime.strptime(holiday_date, "%Y-%m-%d")
                    formatted_eng_date = holiday_date_obj.strftime("%d/%m/%Y")
                    merged_data["formatted_date"] = formatted_eng_date
                    merged_data["holiday_date"] = formatted_eng_date  # root level
                    merged_data["content_data"]["holiday_date"] = formatted_eng_date  # inside content_data
                except ValueError:
                    merged_data["formatted_date"] = holiday_date
                    merged_data["holiday_date"] = holiday_date
                    merged_data["content_data"]["holiday_date"] = holiday_date





    elif notice_type == "guest_lecture":
        template_name = "notices/guest_lecture_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")
        merged_data["origin_type"] = merged_data.get("origin_type") or data.get("origin_type")
        merged_data["category"] = merged_data.get("category") or data.get("category")
        merged_data["department_name"] = merged_data.get("department_name") or data.get("department_name")
        merged_data["committee_name"] = merged_data.get("committee_name") or data.get("committee_name")
        merged_data["committee"] = merged_data.get("committee") or data.get("committee")  # if used in template
        merged_data["departments"] = merged_data.get("departments") or data.get("departments", [])
        merged_data["years"] = merged_data.get("years") or data.get("years", [])
        merged_data["apply_footer"] = merged_data.get("apply_footer") or merged_data.get("applyFooter") or merged_data.get("content_data", {}).get("apply_footer", False)

        lecture_date_str = merged_data.get("date")
        if lecture_date_str:
            try:
                lecture_date_obj = datetime.strptime(lecture_date_str, "%Y-%m-%d")
                merged_data["guest_lecture_date"] = lecture_date_obj.strftime("%d/%m/%Y")
            except ValueError:
                merged_data["guest_lecture_date"] = lecture_date_str

    elif notice_type == "exam":
        template_name = "notices/exam_table_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Handle exam table data and new fields
        merged_data["exam_title"] = merged_data.get("exam_title", "")
        merged_data["exam_month"] = merged_data.get("exam_month", "")
        merged_data["course_dept_semester"] = merged_data.get("course_dept_semester", "")
        merged_data["exam_category"] = merged_data.get("exam_category", "")
        merged_data["introduction_content"] = merged_data.get("introduction_content", "")
        merged_data["instructions"] = merged_data.get("instructions", [])
        merged_data["ending_content"] = merged_data.get("ending_content", "")
        merged_data["exam_table"] = merged_data.get("exam_table", [])  # rows/cols ka json array

    elif notice_type == "assignment":
        template_name = "notices/assignment_submission_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Map only the fields coming from frontend payload
        merged_data["assignment_title"] = merged_data.get("assignment_title", "")
        merged_data["target_groups"] = merged_data.get("target_groups", [])
        merged_data["target_departments"] = merged_data.get("target_departments", [])
        merged_data["introduction_content"] = merged_data.get("introduction_content", "")
        merged_data["instructions"] = merged_data.get("instructions", [])
        merged_data["ending_content"] = merged_data.get("ending_content", "")
        merged_data["signatures"] = merged_data.get("signatures", [])
        merged_data["assignment_table"] = merged_data.get("assignment_table", [])

    elif notice_type == "class_timetable":
        template_name = "notices/class_timetable_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Fields for Class Timetable
        merged_data["timetable_title"] = merged_data.get("timetable_title", "")
        merged_data["semester_title"] = merged_data.get("semester_title", "")
        merged_data["timetable_table"] = merged_data.get("timetable_table", [])
        merged_data["signatures"] = merged_data.get("signatures", [])


    elif notice_type == "lecture_cancellation":
        template_name = "notices/lecture_cancellation_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Remove unused fields to align with frontend payload
        merged_data.pop("audience", None)
        merged_data.pop("reason", None)
        merged_data.pop("cancel_start_date", None)
        merged_data.pop("cancel_end_date", None)
        merged_data.pop("resume_date", None)

    elif notice_type == "sports_events":
        template_name = "notices/sports_events_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

    elif notice_type == "result_marksheet_distribution":
        template_name = "notices/result_marksheet_distribution_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Map expected fields for Result/Marksheet Distribution
        merged_data["result_title"] = merged_data.get("result_title", "")
        merged_data["distribution_date"] = merged_data.get("distribution_date", "")
        merged_data["distribution_time"] = merged_data.get("distribution_time", "")
        merged_data["venue"] = merged_data.get("venue", "")
        merged_data["target_groups"] = merged_data.get("target_groups", [])
        merged_data["target_departments"] = merged_data.get("target_departments", [])
        merged_data["introduction_content"] = merged_data.get("introduction_content", "")
        merged_data["instructions"] = merged_data.get("instructions", [])
        merged_data["ending_content"] = merged_data.get("ending_content", "")
        merged_data["distribution_table"] = merged_data.get("distribution_table", [])
        merged_data["signatures"] = merged_data.get("signatures", [])

    elif notice_type == "revaluation":
        template_name = "notices/revaluation_notice.html"

        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Map expected fields for Revaluation Result notice
        merged_data["result_title"] = merged_data.get("result_title", "")
        merged_data["introduction_content"] = merged_data.get("introduction_content", "")
        merged_data["instructions"] = merged_data.get("instructions", [])
        merged_data["ending_content"] = merged_data.get("ending_content", "")
        merged_data["revaluation_table"] = merged_data.get("revaluation_table", [])
        merged_data["signatures"] = merged_data.get("signatures", [])

    elif notice_type == "photocopy":
        template_name = "notices/photocopy_application_notice.html"
        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Ensure title mandatory
        if not merged_data.get("title") and "content_data" in merged_data:
            merged_data["title"] = merged_data["content_data"].get("title", "")

        if not merged_data.get("title"):
            raise ValueError("Title is required for photocopy notice.")

    # Optional fields
        optional_fields = [
            "introduction_content", "steps_title", "steps",
            "application_start_date", "application_end_date",
            "instructions", "fee_heading", "fee", "fees",
            "note", "ending_content", "signatures"
        ]
        for field in optional_fields:
            if not merged_data.get(field):
                merged_data[field] = merged_data.get("content_data", {}).get(field, "")


    elif notice_type == "industrial_visit":
        template_name = "notices/industrial_visit_notice.html"

        from datetime import date as dt_date, datetime as dt_datetime
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")

        # Expected fields for Industrial Visit / Educational Trip
        merged_data["visit_title"] = merged_data.get("visit_title", "")
        merged_data["destination"] = merged_data.get("destination", "")
        merged_data["mode"] = merged_data.get("mode", merged_data.get("content_data", {}).get("mode", "predefined"))
        merged_data["target_groups"] = merged_data.get("target_groups", [])
        merged_data["target_departments"] = merged_data.get("target_departments", [])
        merged_data["custom_content"] = merged_data.get("custom_content", "")
        merged_data["instructions"] = merged_data.get("instructions", [])
        merged_data["ending_message"] = merged_data.get("ending_message", "")
        merged_data["signatures"] = merged_data.get("signatures", [])

        # Consent form fields
        merged_data["consent_deadline_date"] = merged_data.get("consent_deadline_date", "")
        merged_data["consent_deadline_time"] = merged_data.get("consent_deadline_time", "")
        merged_data["consent_submission_place"] = merged_data.get("consent_submission_place", "")

        # Briefing fields
        merged_data["briefing_date"] = merged_data.get("briefing_date", "")
        merged_data["briefing_time"] = merged_data.get("briefing_time", "")
        merged_data["briefing_venue"] = merged_data.get("briefing_venue", "")

        # Resolve department IDs to names
        def resolve_departments(departments):
            resolved = []
            for dept in departments:
                if isinstance(dept, int) or (isinstance(dept, str) and dept.isdigit()):
                    try:
                        dept_obj = Department.objects.get(id=int(dept))
                        resolved.append(dept_obj.name)
                    except (Department.DoesNotExist, ValueError):
                        resolved.append(str(dept))
                else:
                    # Assume it's already a name
                    resolved.append(str(dept))
            return resolved

        # Handle target_departments
        target_departments_root = merged_data.get("target_departments", [])
        target_departments_content = merged_data.get("content_data", {}).get("target_departments", [])

        resolved_departments = resolve_departments(target_departments_root or target_departments_content)

        merged_data["target_departments"] = resolved_departments
        merged_data["content_data"]["target_departments"] = resolved_departments

        # Date formatting helper
        def _fmt_date(d):
            try:
                return dt_datetime.strptime(d, "%Y-%m-%d").strftime("%d/%m/%Y")
            except Exception:
                return d

        visit_date_raw = merged_data.get("visit_date") or merged_data.get("date")
        if visit_date_raw:
            merged_data["visit_date_formatted"] = _fmt_date(visit_date_raw)

        consent_deadline_raw = merged_data.get("consent_deadline_date")
        if consent_deadline_raw:
            merged_data["consent_deadline_date_formatted"] = _fmt_date(consent_deadline_raw)

        briefing_date_raw = merged_data.get("briefing_date")
        if briefing_date_raw:
            merged_data["briefing_date_formatted"] = _fmt_date(briefing_date_raw)

    elif notice_type == "seminar_workshop_webinar":
        template_name = "notices/seminar_workshop_webinar_notice.html"
        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")
        # Expected fields for Seminars / Workshops / Webinars
        merged_data["title"] = merged_data.get("title", merged_data.get("content_data", {}).get("title", ""))
        # Support either 'content' or 'introduction_content'
        merged_data["introduction_content"] = (
            merged_data.get("content")
            or merged_data.get("introduction_content")
            or merged_data.get("content_data", {}).get("content")
            or merged_data.get("content_data", {}).get("introduction_content", "")
        )
        merged_data["ending_content"] = merged_data.get("ending_content", merged_data.get("content_data", {}).get("ending_content", ""))
        merged_data["signatures"] = merged_data.get("signatures", merged_data.get("content_data", {}).get("signatures", []))
        # Table data
        merged_data["seminar_table"] = merged_data.get("seminar_table", merged_data.get("table_data", []))
    elif notice_type == "internship":
        template_name = "notices/internship_notice.html"
        from datetime import date as dt_date
        merged_data["date"] = dt_date.today().strftime("%d/%m/%Y")

        # Support both root-level and content_data level
        cd = merged_data.get("content_data", {})

        merged_data["title"] = merged_data.get("title") or cd.get("title", "")
        merged_data["introduction_content"] = (
            merged_data.get("introduction_content")
            or merged_data.get("introduction")
            or cd.get("introduction_content", "")
            or cd.get("introduction", "")
        )
        merged_data["organizationName"] = merged_data.get("organizationName") or cd.get("organizationName", "")
        merged_data["internshipProfile"] = merged_data.get("internshipProfile") or cd.get("internshipProfile", [])
        merged_data["internshipDuration"] = merged_data.get("internshipDuration") or cd.get("internshipDuration", "")
        merged_data["stipend"] = merged_data.get("stipend") or cd.get("stipend", "")
        merged_data["location"] = merged_data.get("location") or cd.get("location", "")
        merged_data["endingContent"] = merged_data.get("endingContent") or cd.get("endingContent", "")

    elif notice_type == "library":
        template_name = "notices/library_notice.html"
        from datetime import date as dt_date
        merged_data["date"] = dt_date.today().strftime("%d/%m/%Y")

        # Support both root-level and content_data level
        cd = merged_data.get("content_data", {})

        merged_data["title"] = merged_data.get("title") or cd.get("title", "")
        merged_data["targetGroups"] = merged_data.get("targetGroups") or cd.get("targetGroups", "")
        merged_data["fromDate"] = merged_data.get("fromDate") or cd.get("fromDate", "")
        merged_data["toDate"] = merged_data.get("toDate") or cd.get("toDate", "")
        merged_data["timing"] = merged_data.get("timing") or cd.get("timing", "")
        merged_data["instructions"] = merged_data.get("instructions") or cd.get("instructions", [])
        merged_data["bookIssueStartDate"] = merged_data.get("bookIssueStartDate") or cd.get("bookIssueStartDate", "")
        merged_data["endingContent"] = merged_data.get("endingContent") or cd.get("endingContent", "")

    elif notice_type in ["custom", "miscellaneous", "miscellaneours", "misc"]:
        template_name = "notices/custom_notice.html"
        from datetime import date as dt_date
        merged_data["notice_date"] = dt_date.today().strftime("%d/%m/%Y")
        # No strict schema; pass through fields. Provide common fallbacks.
        cd = merged_data.get("content_data", {})

        # Handle case where content_data is a string (raw HTML from TinyMCE)
        if isinstance(cd, str):
            merged_data["plain_html"] = cd
            cd = {}  # Reset cd to empty dict for further processing
        else:
            # content_data is a dict
            pass

        merged_data["title"] = (
            merged_data.get("title")
            or cd.get("title", "")
            or merged_data.get("custom_title", "")
            or cd.get("custom_title", "")
        )
        # Ensure collections default
        for key in ["sections", "instructions", "signatures"]:
            merged_data[key] = merged_data.get(key, cd.get(key, []))
        # Support tables as either list of table objects or 2D arrays
        merged_data["tables"] = merged_data.get("tables", cd.get("tables", []))
        merged_data["table"] = merged_data.get("table", cd.get("table", []))
        merged_data["custom_table"] = merged_data.get("custom_table", cd.get("custom_table", []))
        # Optional content blocks
        merged_data["plain_html"] = merged_data.get("plain_html", cd.get("plain_html", ""))
        merged_data["introduction_content"] = merged_data.get(
            "introduction_content",
            cd.get("introduction_content", merged_data.get("content", cd.get("content", "")))
        )
        merged_data["ending_content"] = merged_data.get("ending_content", cd.get("ending_content", ""))
        signatures_root = merged_data.get("signatures", [])
        signatures_content = cd.get("signatures", [])
        resolved_signatures = resolve_signatures(signatures_root or signatures_content)
        merged_data["signatures"] = resolved_signatures
        merged_data["content_data"]["signatures"] = resolved_signatures

        # Resolve signatures in ordered_blocks
        ordered_blocks = merged_data.get("ordered_blocks", [])
        for block in ordered_blocks:
            if block.get("type") == "signatures" and "items" in block:
                block["items"] = resolve_signatures(block["items"])
        merged_data["ordered_blocks"] = ordered_blocks

        # Resolve department IDs to names
        def resolve_departments(departments):
            resolved = []
            for dept in departments:
                if isinstance(dept, int) or (isinstance(dept, str) and dept.isdigit()):
                    try:
                        dept_obj = Department.objects.get(id=int(dept))
                        resolved.append(dept_obj.name)
                    except (Department.DoesNotExist, ValueError):
                        resolved.append(str(dept))
                else:
                    # Assume it's already a name
                    resolved.append(str(dept))
            return resolved

        # Handle target_departments
        target_departments_root = merged_data.get("target_departments", [])
        target_departments_content = cd.get("target_departments", [])

        resolved_departments = resolve_departments(target_departments_root or target_departments_content)

        merged_data["target_departments"] = resolved_departments
        merged_data["content_data"]["target_departments"] = resolved_departments

    else:
        raise ValueError(f"Unknown notice type: {notice_type}")

    footer_translations = {
        "english": "Principal",
        "marathi": "प्राचार्य",
        "hindi": "प्राचार्य (प्रिंसिपल)"
    }
    html_string = render_to_string(template_name, {'notice': merged_data})

    if preview:
        return html_string

    # Font config for WeasyPrint
    font_config = FontConfiguration()

    # Generate unique filename
    filename = f"{notice_type}_notice_{uuid.uuid4()}.pdf"
    pdf_dir = os.path.join(settings.MEDIA_ROOT, 'notices_pdfs')
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_file_path = os.path.join(pdf_dir, filename)

    try:
        html_doc = HTML(
            string=html_string,
            base_url=str(settings.BASE_DIR).replace('\\', '/') + '/',
            encoding='utf-8'
        )
        html_doc.write_pdf(
            pdf_file_path,
            font_config=font_config,
            presentational_hints=True,
            optimize_images=True,
            pdf_version='1.7'
        )
    except Exception as e:
        if os.path.exists(pdf_file_path):
            os.remove(pdf_file_path)
        raise Exception(f"PDF generation failed: {str(e)}")

    pdf_url = os.path.join(settings.MEDIA_URL, 'notices_pdfs', filename).replace('\\', '/')
    relative_pdf_path = os.path.join('notices_pdfs', filename).replace('\\', '/')
    return relative_pdf_path, pdf_url

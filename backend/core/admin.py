from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Notice, College, CollegeAdmin, Committee, CommitteeMembership, Department, Letterhead


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role', 'college', 'department']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Fields', {'fields': ('role', 'college', 'department')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Fields', {'fields': ('role', 'college', 'department')}),
    )


class LetterheadAdmin(admin.ModelAdmin):
    list_display = ['name', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ['name']
    ordering = ['-updated_at']


# Register your models here.
admin.site.register(CustomUser,CustomUserAdmin)
admin.site.register(Notice)
admin.site.register(College)
admin.site.register(CollegeAdmin)
admin.site.register(Department)
admin.site.register(Committee)
admin.site.register(CommitteeMembership)
admin.site.register(Letterhead, LetterheadAdmin)



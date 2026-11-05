# CampusNotify – College Notification Management System

A web-based college notification management system designed to simplify and centralize the creation, management, and publishing of academic notices.

## About the Project

CampusNotify is an academic web application developed to help colleges manage and distribute important notifications through a centralized digital platform.

The system aims to reduce manual notice management and make academic information more accessible to students and college administrators.

## Problem Statement

Traditional college notification systems often depend on physical notice boards, manual communication, and scattered information sources. This can make it difficult to manage, update, and access important announcements.

CampusNotify provides a centralized platform where authorized college administrators can create, manage, and publish notices efficiently.

## Key Features

- **Notice Management:** Create and manage college notifications.
- **Role-Based Access:** Separate administrative access for authorized users.
- **Notice Publishing:** Manage and publish academic announcements.
- **PDF Generation:** Generate downloadable PDF documents for supported notices.
- **Holiday Notices:** Create and generate holiday notification PDFs.
- **Guest Lecture Notices:** Manage guest lecture announcements and generate PDFs.
- **Examination Notices:** Display examination-related information in a structured format.
- **Rich Text Editing:** Create formatted notice content using TinyMCE.
- **REST API Integration:** Connect the React frontend with the Django backend.
- **Authentication:** JWT-based authentication using SimpleJWT.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Python, Django |
| API | Django REST Framework |
| Authentication | SimpleJWT |
| Database | PostgreSQL |
| Rich Text Editor | TinyMCE |
| Development Tools | VS Code, Git, GitHub |

## System Overview

CampusNotify follows a frontend-backend architecture.

1. The React frontend provides the user interface.
2. The Django REST Framework backend handles application logic and API requests.
3. PostgreSQL stores application data.
4. JWT authentication handles authenticated access.
5. The frontend communicates with the backend through REST APIs.

## User Roles

- **Administrator:** Manages notices and administrative activities.
- **Principal:** Has authorized access to the notice management system.

## Project Status

This project is developed as an academic project and is currently under development and improvement.

Core notice management and several PDF generation features have been implemented. Some features are still being refined.

## Future Scope

- Improved notice search and filtering.
- Additional notification categories.
- Enhanced user experience.
- Further improvements to notice management and reporting.

## Academic Project

Developed as part of the Master of Computer Applications (MCA) program at MES' Institute of Management & Career Courses (IMCC), Pune.

**Project Name:** CampusNotify

**Category:** College Management / Web Application

**Development Type:** Academic Team Project

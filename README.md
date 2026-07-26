# 🏥 MediCarePlus – Doctor Appointment Management System

> A full-stack healthcare platform that simplifies the process of booking, managing, and tracking medical appointments between patients and healthcare providers. Built using **Spring Boot**, **React.js**, **MySQL**, **Redis**, and **WebSockets**, the system provides secure authentication, real-time notifications, and efficient appointment management.

---

## 📖 Overview

**MediCarePlus** is a modern healthcare appointment management system designed to bridge the gap between patients and doctors through an intuitive web application.

Patients can search for doctors, view their profiles, book appointments, and manage their medical visits, while doctors can manage their availability and appointment schedules. Administrators oversee platform operations, user management, and doctor verification.

The application follows a secure, scalable architecture with JWT-based authentication, role-based authorization, Redis caching, and real-time communication.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

* User Registration (Patient & Doctor)
* Secure Login & Logout
* JWT-based Authentication
* BCrypt Password Encryption
* Role-Based Access Control (RBAC)
* Protected REST APIs

---

## 👨‍⚕️ Patient Features

* Register and manage profile
* Search doctors by specialization
* View doctor profiles
* Check doctor availability
* Book appointments
* Cancel appointments
* View appointment history
* Receive real-time appointment updates

---

## 🩺 Doctor Features

* Manage profile
* Add and update availability schedules
* Accept or reject appointments
* Update appointment status
* View patient details
* Manage daily appointment schedule

---

## 👨‍💼 Admin Features

* Approve doctor registrations
* Manage doctors and patients
* Monitor appointments
* Manage platform users
* Generate reports and analytics

---

## ⚡ Real-Time Features

* WebSocket-powered live appointment updates
* Instant booking status notifications
* Real-time appointment confirmations
* Live dashboard synchronization

---

## 🚀 Performance Optimization

* Redis caching for frequently accessed data
* Optimized database queries
* Fast REST API responses
* Efficient appointment scheduling

---

## 📊 Appointment Management

* Book appointments
* Cancel appointments
* Appointment status tracking
* Doctor availability management
* Appointment history
* Conflict-free scheduling

---

# 💼 Business Model

MediCarePlus functions as a **Healthcare Appointment Marketplace**, connecting patients with healthcare providers through a centralized booking platform.

### Business Workflow

```text
Patient Registration/Login
            │
            ▼
Search Doctor
            │
            ▼
View Doctor Profile
            │
            ▼
Check Availability
            │
            ▼
Book Appointment
            │
            ▼
Doctor Accepts / Rejects
            │
            ▼
Appointment Completed
            │
            ▼
Payment (Future Enhancement)
            │
            ▼
Admin Monitoring & Reporting
```

---

# 👥 User Roles

### 👤 Patient

* Search doctors
* Book appointments
* Manage appointments
* View appointment history

### 👨‍⚕️ Doctor

* Manage availability
* Accept/Reject appointments
* Update appointment status
* View patient information

### 👨‍💼 Administrator

* Manage users
* Approve doctor registrations
* Monitor appointments
* Generate reports

---

# 🛠 Tech Stack

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Spring WebSocket
* JWT Authentication

## Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Tailwind CSS

## Database

* MySQL

## Cache

* Redis

## Communication

* WebSockets

## Build Tools

* Maven
* npm

---

# 🏗 System Architecture

The application follows a **Monolithic Architecture**, where all core modules are integrated into a single Spring Boot application while maintaining modular separation.

### Core Modules

### 🔐 Authentication Module

Responsibilities:

* User Registration
* Login
* JWT Generation
* Role-Based Authentication
* Password Encryption

---

### 👥 User Management Module

Responsibilities:

* Patient Profile Management
* Doctor Profile Management
* User Administration
* Role Management

---

### 📅 Appointment Module

Responsibilities:

* Book Appointment
* Cancel Appointment
* Appointment Status Management
* Appointment History

---

### 🩺 Doctor Module

Responsibilities:

* Manage Doctor Profiles
* Availability Scheduling
* Specialization Management
* Appointment Approval

---

### 🔔 Notification Module

Responsibilities:

* Real-time appointment updates
* Booking confirmations
* Appointment status notifications
* WebSocket communication

---

### 💾 Database Module

Responsibilities:

* Store user information
* Doctor details
* Patient records
* Appointment history
* Availability schedules

---

# 📂 Project Structure

```text
MediCarePlus/
│
├── backend/
│   ├── authentication/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   ├── websocket/
│   ├── security/
│   └── config/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── assets/
│
├── database/
│
├── screenshots/
│
└── README.md
```

---

# 🔒 Non-Functional Requirements

* JWT-based Security
* BCrypt Password Encryption
* Responsive User Interface
* Role-Based Authorization
* Optimized API Performance
* Scalable Architecture
* Transactional Data Consistency
* Clean Code Architecture
* Easy Maintainability

---

# 📸 System Diagrams

## User Roles

> *(Insert your User Roles diagram here.)*

---

## Monolithic Architecture

> *(Insert your Monolithic Architecture diagram here.)*

---

## Entity Relationship Diagram (ER Diagram)

> *(Insert your ER Diagram here.)*

---

# 🚀 Future Enhancements

* 💳 Online Payment Gateway Integration
* 📧 Email Notifications
* 📱 SMS Appointment Reminders
* 🤖 AI-based Doctor Recommendation
* 📹 Video Consultation
* 🌐 Multi-Hospital Support
* 📅 Google Calendar Integration
* 📄 Electronic Medical Records (EMR)
* ⭐ Doctor Ratings & Reviews
* 📊 Analytics Dashboard
* 🐳 Docker & Kubernetes Deployment

---

# 👨‍💻 Author

**Soham Kadam**

* GitHub: https://github.com/sohamkadam01
* LinkedIn: https://linkedin.com/in/kadamsoham0015

---

# ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star** on GitHub. It helps others discover the project and motivates future improvements.

# MediCarePlus-Doctor-Appointment-System
MediCarePlus is a web-based Doctor Appointment Management System designed to streamline the process of booking, managing, and tracking medical appointments between patients and healthcare providers.


**Business Model Understanding**



 **Project Type:**
This is a Booking System (Healthcare Appointment Marketplace)


 **Business Flow**

 
1.Patient registers/login


2.Patient searches doctor (by specialization/location)


3.Patient checks availability


4.Patient books appointment


5.Doctor accepts/rejects


6.Appointment happens



7.Payment (optional for now)


8.Admin manages platform

**Identify User Roles**

<img width="665" height="221" alt="user" src="https://github.com/user-attachments/assets/5301d9eb-6879-45cb-8ed5-d9204f4f2610" />

**Functional Requirements**


These define what the system should do.


**🔹 Authentication**


User Registration (Doctor / Patient)


Login / Logout


JWT-based authentication


Password reset


**🔹 Patient Features**


Search doctors (by specialization, location)


View doctor profile


Book appointment


Cancel appointment


View appointment history


**🔹 Doctor Features**


Add availability schedule


Accept/Reject appointment


Update appointment status (Completed / Cancelled)


View patient details


**🔹 Admin Features**


Approve doctor registration


Manage users


View all appointments


Generate reports



**4️⃣ Non-Functional Requirements (NFR)**


These define how systems should behave.
🔐 Security (JWT, password encryption using BCrypt)


⚡ Performance (API response < 2 seconds)


📈 Scalability (Support 1000+ users)


🧾 Maintainability (Clean architecture)


📱 Responsive UI


🛡 Role-based access control


💾 Data consistency (Transactional DB)


**Monolithic Architecture**
<img width="900" height="1500" alt="deepseek_mermaid_20260218_a96de4" src="https://github.com/user-attachments/assets/d5abfdde-09e1-41c9-9054-8dd95e5f547e" />

**Core Modules Design**


🔐 1. Authentication & Authorization Module

Responsibilities:

Register

Login

Generate JWT

Role-based access

Tables:

users

roles

**👥 2. User Management Module**

Responsibilities:

Update profile

View profile

Admin user control

Tables:

users

doctor_details

patient_details

**📅 3. Appointment Management Module**

Responsibilities:

Book appointment

Cancel appointment

Update status

Tables:

appointments

doctor_availability



**🏥 4. Doctor/Service Module**

Responsibilities:

Add specialization

Manage availability

Approve doctors

Tables:

specializations

doctor_availability



<img width="550" height="1000" alt="deepseek_mermaid_20260218_ed4bc2" src="https://github.com/user-attachments/assets/f29ac2c0-16d2-4e71-9670-06b4877e0ec7" />






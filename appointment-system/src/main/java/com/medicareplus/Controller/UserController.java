// package com.medicareplus.Controller;

// import java.util.List;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.time.YearMonth;
// import java.util.ArrayList;
// import java.util.Comparator;
// import java.util.LinkedHashMap;
// import java.util.Map;
// import java.util.Objects;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import com.medicareplus.Models.User;
// import com.medicareplus.Models.UserRole;
// import com.medicareplus.Models.UserStatus;
// import com.medicareplus.Models.Appointment;
// import com.medicareplus.Models.AppointmentStatus;
// import com.medicareplus.Models.DoctorDetails;
// import com.medicareplus.Models.Specializations;
// import com.medicareplus.Repository.AppointmentRepository;
// import com.medicareplus.Repository.DoctorDetailsRepository;
// import com.medicareplus.Repository.SpecializationsRepository;
// import com.medicareplus.Service.UserService;
// import com.medicareplus.Service.AdminActivityService;
// import com.medicareplus.Service.OtpService;
// import com.medicareplus.DTO.OtpVerificationRequest;
// import lombok.RequiredArgsConstructor;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/api/users")
// @CrossOrigin("*")
// @RequiredArgsConstructor
// public class UserController {

//     private final UserService userService;
//     private final AdminActivityService adminActivityService;
//     private final DoctorDetailsRepository doctorDetailsRepository;
//     private final SpecializationsRepository specializationsRepository;
//     private final AppointmentRepository appointmentRepository;
//     private final OtpService otpService;

//     /**
//      * =============================================
//      * REGISTRATION ENDPOINTS WITH OTP VERIFICATION
//      * =============================================
//      */

// @PostMapping("/register/patient")
// public ResponseEntity<?> registerPatient(@RequestBody User user) {
//     try {
//         user.setRole(UserRole.PATIENT);
//         User registeredUser = otpService.registerUser(
//             user.getEmail(),
//             user.getPassword(),
//             user.getName(),
//             user.getPhone(),  // ← ADD THIS!
//             user.getRole()
//         );
        
//         return ResponseEntity.ok(Map.of(
//             "success", true,
//             "message", "Registration successful! Please check your email for OTP.",
//             "userId", registeredUser.getId(),
//             "email", registeredUser.getEmail(),
//             "name", registeredUser.getName(),
//             "phone", registeredUser.getPhone(),  // ← Add this
//             "verified", registeredUser.isVerified(),
//             "role", registeredUser.getRole()
//         ));
//     } catch (RuntimeException e) {
//         return ResponseEntity.badRequest()
//             .body(Map.of("success", false, "message", e.getMessage()));
//     }
// }

// @PostMapping("/register/doctor")
// public ResponseEntity<?> registerDoctor(@RequestBody User user) {
//     try {
//         user.setRole(UserRole.DOCTOR);
//         User registeredUser = otpService.registerUser(
//             user.getEmail(),
//             user.getPassword(),
//             user.getName(),
//             user.getPhone(),  // ← ADD THIS!
//             user.getRole()
//         );
        
//         return ResponseEntity.ok(Map.of(
//             "success", true,
//             "message", "Registration successful! Please check your email for OTP.",
//             "userId", registeredUser.getId(),
//             "email", registeredUser.getEmail(),
//             "name", registeredUser.getName(),
//             "phone", registeredUser.getPhone(),  // ← Add this to response
//             "verified", registeredUser.isVerified(),
//             "role", registeredUser.getRole()
//         ));
//     } catch (RuntimeException e) {
//         return ResponseEntity.badRequest()
//             .body(Map.of("success", false, "message", e.getMessage()));
//     }
// }

//     @PostMapping("/register/lab")
//     public ResponseEntity<?> registerLab(@RequestBody User user) {
//         try {
//             user.setRole(UserRole.LAB);
//             User registeredUser = otpService.registerUser(
//                 user.getEmail(),
//                 user.getPassword(),
//                 user.getName(),
//                 user.getPhone(),
//                 user.getRole()
//             );
//             userService.updateUserStatus(registeredUser.getId(), UserStatus.PENDING_APPROVAL);

//             return ResponseEntity.ok(Map.of(
//                 "success", true,
//                 "message", "Registration successful! Please check your email for OTP.",
//                 "userId", registeredUser.getId(),
//             "email", registeredUser.getEmail(),
//             "name", registeredUser.getName(),
//             "phone", registeredUser.getPhone(),
//             "verified", registeredUser.isVerified(),
//             "role", registeredUser.getRole()
//         ));
//     } catch (RuntimeException e) {
//         return ResponseEntity.badRequest()
//             .body(Map.of("success", false, "message", e.getMessage()));
//     }
// }




//  @PostMapping("/register/admin")
// public ResponseEntity<?> registerAdmin(@RequestBody User user) {
//     try {
//         user.setRole(UserRole.ADMIN);
//         user.setVerified(true);  // ← ADD THIS LINE!
        
//         User registeredUser = userService.registerAdmin(user);
        
//         return ResponseEntity.ok(Map.of(
//             "success", true,
//             "message", "Admin registration successful!",
//             "userId", registeredUser.getId(),
//             "email", registeredUser.getEmail(),
//             "name", registeredUser.getName(),
//             "verified", registeredUser.isVerified(),
//             "role", registeredUser.getRole()
//         ));
//     } catch (RuntimeException e) {
//         return ResponseEntity.badRequest()
//             .body(Map.of("success", false, "message", e.getMessage()));
//     }
// }

//     /**
//      * =============================================
//      * OTP VERIFICATION ENDPOINTS
//      * =============================================
//      */

//     @PostMapping("/verify-otp")
//     public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
//         try {
//             boolean verified = otpService.verifyOtp(
//                 request.getEmail(), 
//                 request.getOtp()
//             );
            
//             if (verified) {
//                 return ResponseEntity.ok(Map.of(
//                     "success", true,
//                     "message", "Email verified successfully! You can now login.",
//                     "email", request.getEmail()
//                 ));
//             } else {
//                 return ResponseEntity.badRequest()
//                     .body(Map.of("success", false, "message", "Verification failed"));
//             }
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest()
//                 .body(Map.of("success", false, "message", e.getMessage()));
//         }
//     }

//     @PostMapping("/resend-otp")
//     public ResponseEntity<?> resendOtp(@RequestParam String email) {
//         try {
//             otpService.resendOtp(email);
//             return ResponseEntity.ok(Map.of(
//                 "success", true,
//                 "message", "New OTP sent successfully. Please check your email.",
//                 "email", email
//             ));
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest()
//                 .body(Map.of("success", false, "message", e.getMessage()));
//         }
//     }

//     @GetMapping("/verification-status")
//     public ResponseEntity<?> getVerificationStatus(@RequestParam String email) {
//         try {
//             User user = userService.getUserByEmail(email);
//             return ResponseEntity.ok(Map.of(
//                 "email", user.getEmail(),
//                 "verified", user.isVerified(),
//                 "name", user.getName(),
//                 "role", user.getRole()
//             ));
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest()
//                 .body(Map.of("success", false, "message", "User not found"));
//         }
//     }

//     /**
//      * =============================================
//      * EXISTING ADMIN/DOCTOR MANAGEMENT ENDPOINTS
//      * =============================================
//      */

//     @GetMapping("/admins")
//     public ResponseEntity<List<User>> getAllAdmins() {
//         List<User> admins = userService.getUsersByRole(UserRole.ADMIN);
//         return ResponseEntity.ok(admins);
//     }

//     @GetMapping("/doctors/pending")
//     public ResponseEntity<List<User>> getPendingDoctors() {
//         List<User> pendingDoctors = userService.getPendingDoctors();
//         return ResponseEntity.ok(pendingDoctors);
//     }

//     @PutMapping("/doctors/{id}/approve")
//     public ResponseEntity<?> approveDoctor(@PathVariable Integer id) {
//         try {
//             User approvedDoctor = userService.approveDoctor(id);
//             User actor = getCurrentUserOrNull();
            
//             Long doctorIdLong = approvedDoctor.getId() != null ? approvedDoctor.getId().longValue() : null;
            
//             adminActivityService.log(
//                     "DOCTOR_APPROVED",
//                     "Doctor approved: " + approvedDoctor.getName(),
//                     actor != null ? actor.getRole().name() : "ADMIN",
//                     actor != null ? actor.getId() : null,
//                     actor != null ? actor.getName() : "Admin",
//                     "DOCTOR",
//                     doctorIdLong
//             );
//             return ResponseEntity.ok(approvedDoctor);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//         }
//     }

//     @PutMapping("/doctors/{id}/reject")
//     public ResponseEntity<User> rejectDoctor(@PathVariable Integer id) {
//         User rejectedDoctor = userService.updateUserStatus(id, UserStatus.SUSPENDED);
//         User actor = getCurrentUserOrNull();
//         adminActivityService.log(
//                 "DOCTOR_REJECTED",
//                 "Doctor rejected: " + rejectedDoctor.getName(),
//                 actor != null ? actor.getRole().name() : "ADMIN",
//                 actor != null ? actor.getId() : null,
//                 actor != null ? actor.getName() : "Admin",
//                 "DOCTOR",
//                 rejectedDoctor.getId().longValue()
//         );
//         return ResponseEntity.ok(rejectedDoctor);
//     }

//     @GetMapping("/doctors/pending/details")
//     public ResponseEntity<List<PendingDoctorDetails>> getPendingDoctorsWithDetails() {
//         List<PendingDoctorDetails> result = userService.getPendingDoctors()
//                 .stream()
//                 .map(this::mapDoctorWithDetails)
//                 .toList();

//         return ResponseEntity.ok(result);
//     }

//     @GetMapping("/doctors/details")
//     public ResponseEntity<List<PendingDoctorDetails>> getAllDoctorsWithDetails() {
//         List<PendingDoctorDetails> result = userService.getUsersByRole(UserRole.DOCTOR)
//                 .stream()
//                 .map(this::mapDoctorWithDetails)
//                 .toList();

//         return ResponseEntity.ok(result);
//     }

//     @GetMapping("/role/{role}")
//     public ResponseEntity<List<User>> getUsersByRole(@PathVariable UserRole role) {
//         List<User> users = userService.getUsersByRole(role);
//         return ResponseEntity.ok(users);
//     }

//     @GetMapping("/role/{role}/active")
//     public ResponseEntity<List<User>> getActiveUsersByRole(@PathVariable UserRole role) {
//         List<User> users = userService.getActiveUsersByRole(role);
//         return ResponseEntity.ok(users);
//     }

//     @GetMapping
//     public ResponseEntity<List<User>> getAllUsers() {
//         List<User> users = userService.getAllUsers();
//         return ResponseEntity.ok(users);
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<User> getUserById(@PathVariable Integer id) {
//         User user = userService.getUserById(id);
//         return ResponseEntity.ok(user);
//     }

//     @GetMapping("/email/{email}")
//     public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
//         User user = userService.getUserByEmail(email);
//         return ResponseEntity.ok(user);
//     }

//     @GetMapping("/phone/{phone}")
//     public ResponseEntity<User> getUserByPhone(@PathVariable String phone) {
//         User user = userService.getUserByPhone(phone);
//         return ResponseEntity.ok(user);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User user) {
//         User updatedUser = userService.updateUser(id, user);
//         return ResponseEntity.ok(updatedUser);
//     }

//     @PutMapping("/{id}/status")
//     public ResponseEntity<User> updateUserStatus(@PathVariable Integer id, @RequestParam UserStatus status) {
//         User updatedUser = userService.updateUserStatus(id, status);
//         return ResponseEntity.ok(updatedUser);
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
//         userService.deleteUser(id);
//         return ResponseEntity.ok("User deleted successfully");
//     }

//     @GetMapping("/count")
//     public ResponseEntity<Long> getTotalUsers() {
//         return ResponseEntity.ok(userService.getTotalUsers());
//     }

//     @GetMapping("/count/role/{role}")
//     public ResponseEntity<Long> getCountByRole(@PathVariable UserRole role) {
//         return ResponseEntity.ok(userService.getCountByRole(role));
//     }

//     /**
//      * =============================================
//      * STATISTICS & ANALYTICS ENDPOINTS
//      * =============================================
//      */

//     @GetMapping("/stats")
//     public ResponseEntity<UserStats> getUserStats() {
//         UserStats stats = new UserStats();
//         stats.setTotalUsers(userService.getTotalUsers());
//         stats.setTotalPatients(userService.getCountByRole(UserRole.PATIENT));
//         stats.setTotalDoctors(userService.getCountByRole(UserRole.DOCTOR));
//         stats.setTotalAdmins(userService.getCountByRole(UserRole.ADMIN));
//         stats.setPendingDoctors((long) userService.getPendingDoctors().size());

//         int trendWindowDays = 30;
//         LocalDateTime threshold = LocalDate.now().minusDays(trendWindowDays - 1L).atStartOfDay();

//         List<User> allUsers = userService.getAllUsers();
//         List<User> patients = userService.getUsersByRole(UserRole.PATIENT);
//         List<User> doctors = userService.getUsersByRole(UserRole.DOCTOR);

//         long newUsers = allUsers.stream()
//                 .map(User::getCreatedAt)
//                 .filter(Objects::nonNull)
//                 .filter(dt -> !dt.isBefore(threshold))
//                 .count();
//         long newPatients = patients.stream()
//                 .map(User::getCreatedAt)
//                 .filter(Objects::nonNull)
//                 .filter(dt -> !dt.isBefore(threshold))
//                 .count();
//         long newDoctors = doctors.stream()
//                 .map(User::getCreatedAt)
//                 .filter(Objects::nonNull)
//                 .filter(dt -> !dt.isBefore(threshold))
//                 .count();

//         stats.setAverageDailyUsers(newUsers / (double) trendWindowDays);
//         stats.setAverageDailyPatients(newPatients / (double) trendWindowDays);
//         stats.setAverageDailyDoctors(newDoctors / (double) trendWindowDays);
//         return ResponseEntity.ok(stats);
//     }

//     @GetMapping("/analytics/overview")
//     public ResponseEntity<AnalyticsOverview> getAnalyticsOverview(
//             @RequestParam(defaultValue = "7") Integer days) {
//         int safeDays = Math.max(1, Math.min(days, 90));
//         LocalDate today = LocalDate.now();
//         LocalDate startDate = today.minusDays(safeDays - 1L);
//         LocalDateTime startDateTime = startDate.atStartOfDay();
//         LocalDateTime tomorrowStart = today.plusDays(1).atStartOfDay();

//         List<User> allUsers = userService.getAllUsers();
//         List<Appointment> rangeAppointments = appointmentRepository.findByAppointmentDateBetween(startDate, today);
//         List<Appointment> allAppointments = appointmentRepository.findAll();

//         Map<LocalDate, Long> dailyUsers = new LinkedHashMap<>();
//         Map<LocalDate, Long> dailyAppointments = new LinkedHashMap<>();
//         for (int i = 0; i < safeDays; i++) {
//             LocalDate d = startDate.plusDays(i);
//             dailyUsers.put(d, 0L);
//             dailyAppointments.put(d, 0L);
//         }

//         for (User user : allUsers) {
//             if (user.getCreatedAt() == null) {
//                 continue;
//             }
//             LocalDateTime createdAt = user.getCreatedAt();
//             if (!createdAt.isBefore(startDateTime) && createdAt.isBefore(tomorrowStart)) {
//                 LocalDate date = createdAt.toLocalDate();
//                 dailyUsers.computeIfPresent(date, (k, v) -> v + 1L);
//             }
//         }

//         long pendingAppointments = 0L;
//         long confirmedAppointments = 0L;
//         long completedAppointments = 0L;
//         long cancelledAppointments = 0L;
//         double revenueInRange = 0.0;

//         for (Appointment appointment : rangeAppointments) {
//             if (appointment.getAppointmentDate() != null) {
//                 dailyAppointments.computeIfPresent(appointment.getAppointmentDate(), (k, v) -> v + 1L);
//             }
//             if (appointment.getStatus() == AppointmentStatus.PENDING) pendingAppointments++;
//             if (appointment.getStatus() == AppointmentStatus.CONFIRMED) confirmedAppointments++;
//             if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
//                 completedAppointments++;
//                 revenueInRange += appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0;
//             }
//             if (appointment.getStatus() == AppointmentStatus.CANCELLED) cancelledAppointments++;
//         }

//         double totalRevenue = 0.0;
//         for (Appointment appointment : allAppointments) {
//             if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
//                 totalRevenue += appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0;
//             }
//         }

//         long activeDoctors = userService.getUsersByRole(UserRole.DOCTOR).stream()
//                 .filter(u -> u.getStatus() == UserStatus.ACTIVE)
//                 .count();

//         long newUsersToday = allUsers.stream()
//                 .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().toLocalDate().isEqual(today))
//                 .count();

//         AnalyticsOverview overview = new AnalyticsOverview();
//         overview.setDays(safeDays);
//         overview.setTotalUsers(allUsers.size());
//         overview.setTotalAppointments((long) allAppointments.size());
//         overview.setRangeAppointments((long) rangeAppointments.size());
//         overview.setPendingAppointments(pendingAppointments);
//         overview.setConfirmedAppointments(confirmedAppointments);
//         overview.setCompletedAppointments(completedAppointments);
//         overview.setCancelledAppointments(cancelledAppointments);
//         overview.setActiveDoctors(activeDoctors);
//         overview.setNewUsersToday(newUsersToday);
//         overview.setTotalRevenue(totalRevenue);
//         overview.setRevenueInRange(revenueInRange);

//         List<DailyMetric> userSeries = new ArrayList<>();
//         dailyUsers.forEach((date, count) -> userSeries.add(new DailyMetric(date.toString(), count)));
//         List<DailyMetric> appointmentSeries = new ArrayList<>();
//         dailyAppointments.forEach((date, count) -> appointmentSeries.add(new DailyMetric(date.toString(), count)));
//         overview.setDailyRegistrations(userSeries);
//         overview.setDailyAppointments(appointmentSeries);

//         return ResponseEntity.ok(overview);
//     }

//     @GetMapping("/analytics/detailed")
//     public ResponseEntity<DetailedAnalyticsOverview> getDetailedAnalytics(
//             @RequestParam(defaultValue = "6") Integer months) {
//         int safeMonths = Math.max(1, Math.min(months, 24));
//         LocalDate today = LocalDate.now();
//         LocalDate startDate = today.minusMonths(safeMonths - 1L).withDayOfMonth(1);

//         List<Object[]> doctorRows = appointmentRepository.getDoctorRevenueSummary(startDate, today);
//         List<Object[]> monthlyRows = appointmentRepository.getMonthlyRevenueSummary(startDate, today);

//         Map<YearMonth, MonthlyMetric> monthlyMap = new LinkedHashMap<>();
//         YearMonth startYm = YearMonth.from(startDate);
//         YearMonth endYm = YearMonth.from(today);
//         YearMonth cursor = startYm;
//         while (!cursor.isAfter(endYm)) {
//             MonthlyMetric mm = new MonthlyMetric();
//             mm.setMonth(cursor.toString());
//             mm.setAppointments(0L);
//             mm.setRevenue(0.0);
//             monthlyMap.put(cursor, mm);
//             cursor = cursor.plusMonths(1);
//         }

//         for (Object[] row : monthlyRows) {
//             int year = ((Number) row[0]).intValue();
//             int month = ((Number) row[1]).intValue();
//             long appointments = ((Number) row[2]).longValue();
//             double revenue = ((Number) row[3]).doubleValue();
//             YearMonth ym = YearMonth.of(year, month);
//             MonthlyMetric existing = monthlyMap.get(ym);
//             if (existing != null) {
//                 existing.setAppointments(appointments);
//                 existing.setRevenue(revenue);
//             }
//         }

//         double totalRevenue = doctorRows.stream()
//                 .mapToDouble(row -> ((Number) row[3]).doubleValue())
//                 .sum();
//         long totalCompletedAppointments = doctorRows.stream()
//                 .mapToLong(row -> ((Number) row[2]).longValue())
//                 .sum();

//         List<DoctorRevenueMetric> topDoctors = doctorRows.stream()
//                 .map(row -> {
//                     DoctorRevenueMetric metric = new DoctorRevenueMetric();
//                     metric.setDoctorId(((Number) row[0]).intValue());
//                     metric.setDoctorName((String) row[1]);
//                     metric.setCompletedAppointments(((Number) row[2]).longValue());
//                     metric.setRevenue(((Number) row[3]).doubleValue());
//                     return metric;
//                 })
//                 .sorted(Comparator.comparingDouble(DoctorRevenueMetric::getRevenue).reversed())
//                 .limit(10)
//                 .toList();

//         DetailedAnalyticsOverview detailed = new DetailedAnalyticsOverview();
//         detailed.setMonths((int) monthlyMap.size());
//         detailed.setFromDate(startDate.toString());
//         detailed.setToDate(today.toString());
//         detailed.setTopDoctors(topDoctors);
//         detailed.setMonthlyTrends(new ArrayList<>(monthlyMap.values()));
//         detailed.setTotalRevenue(totalRevenue);
//         detailed.setTotalCompletedAppointments(totalCompletedAppointments);
//         return ResponseEntity.ok(detailed);
//     }

//     /**
//      * =============================================
//      * INNER CLASSES (Keep all your existing DTOs)
//      * =============================================
//      */

//     static class UserStats {
//         private long totalUsers;
//         private long totalPatients;
//         private long totalDoctors;
//         private long totalAdmins;
//         private long pendingDoctors;
//         private double averageDailyUsers;
//         private double averageDailyPatients;
//         private double averageDailyDoctors;

//         public long getTotalUsers() { return totalUsers; }
//         public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
//         public long getTotalPatients() { return totalPatients; }
//         public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }
//         public long getTotalDoctors() { return totalDoctors; }
//         public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }
//         public long getTotalAdmins() { return totalAdmins; }
//         public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }
//         public long getPendingDoctors() { return pendingDoctors; }
//         public void setPendingDoctors(long pendingDoctors) { this.pendingDoctors = pendingDoctors; }
//         public double getAverageDailyUsers() { return averageDailyUsers; }
//         public void setAverageDailyUsers(double averageDailyUsers) { this.averageDailyUsers = averageDailyUsers; }
//         public double getAverageDailyPatients() { return averageDailyPatients; }
//         public void setAverageDailyPatients(double averageDailyPatients) { this.averageDailyPatients = averageDailyPatients; }
//         public double getAverageDailyDoctors() { return averageDailyDoctors; }
//         public void setAverageDailyDoctors(double averageDailyDoctors) { this.averageDailyDoctors = averageDailyDoctors; }
//     }

//     static class DailyMetric {
//         private String date;
//         private long count;

//         DailyMetric(String date, long count) {
//             this.date = date;
//             this.count = count;
//         }

//         public String getDate() { return date; }
//         public void setDate(String date) { this.date = date; }
//         public long getCount() { return count; }
//         public void setCount(long count) { this.count = count; }
//     }

//     static class AnalyticsOverview {
//         private int days;
//         private long totalUsers;
//         private long totalAppointments;
//         private long rangeAppointments;
//         private long pendingAppointments;
//         private long confirmedAppointments;
//         private long completedAppointments;
//         private long cancelledAppointments;
//         private long activeDoctors;
//         private long newUsersToday;
//         private double totalRevenue;
//         private double revenueInRange;
//         private List<DailyMetric> dailyRegistrations;
//         private List<DailyMetric> dailyAppointments;

//         public int getDays() { return days; }
//         public void setDays(int days) { this.days = days; }
//         public long getTotalUsers() { return totalUsers; }
//         public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
//         public long getTotalAppointments() { return totalAppointments; }
//         public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }
//         public long getRangeAppointments() { return rangeAppointments; }
//         public void setRangeAppointments(long rangeAppointments) { this.rangeAppointments = rangeAppointments; }
//         public long getPendingAppointments() { return pendingAppointments; }
//         public void setPendingAppointments(long pendingAppointments) { this.pendingAppointments = pendingAppointments; }
//         public long getConfirmedAppointments() { return confirmedAppointments; }
//         public void setConfirmedAppointments(long confirmedAppointments) { this.confirmedAppointments = confirmedAppointments; }
//         public long getCompletedAppointments() { return completedAppointments; }
//         public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }
//         public long getCancelledAppointments() { return cancelledAppointments; }
//         public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }
//         public long getActiveDoctors() { return activeDoctors; }
//         public void setActiveDoctors(long activeDoctors) { this.activeDoctors = activeDoctors; }
//         public long getNewUsersToday() { return newUsersToday; }
//         public void setNewUsersToday(long newUsersToday) { this.newUsersToday = newUsersToday; }
//         public double getTotalRevenue() { return totalRevenue; }
//         public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
//         public double getRevenueInRange() { return revenueInRange; }
//         public void setRevenueInRange(double revenueInRange) { this.revenueInRange = revenueInRange; }
//         public List<DailyMetric> getDailyRegistrations() { return dailyRegistrations; }
//         public void setDailyRegistrations(List<DailyMetric> dailyRegistrations) { this.dailyRegistrations = dailyRegistrations; }
//         public List<DailyMetric> getDailyAppointments() { return dailyAppointments; }
//         public void setDailyAppointments(List<DailyMetric> dailyAppointments) { this.dailyAppointments = dailyAppointments; }
//     }

//     static class DoctorRevenueMetric {
//         private Integer doctorId;
//         private String doctorName;
//         private long completedAppointments;
//         private double revenue;

//         public Integer getDoctorId() { return doctorId; }
//         public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
//         public String getDoctorName() { return doctorName; }
//         public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
//         public long getCompletedAppointments() { return completedAppointments; }
//         public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }
//         public double getRevenue() { return revenue; }
//         public void setRevenue(double revenue) { this.revenue = revenue; }
//     }

//     static class MonthlyMetric {
//         private String month;
//         private long appointments;
//         private double revenue;

//         public String getMonth() { return month; }
//         public void setMonth(String month) { this.month = month; }
//         public long getAppointments() { return appointments; }
//         public void setAppointments(long appointments) { this.appointments = appointments; }
//         public double getRevenue() { return revenue; }
//         public void setRevenue(double revenue) { this.revenue = revenue; }
//     }

//     static class DetailedAnalyticsOverview {
//         private int months;
//         private String fromDate;
//         private String toDate;
//         private long totalCompletedAppointments;
//         private double totalRevenue;
//         private List<DoctorRevenueMetric> topDoctors;
//         private List<MonthlyMetric> monthlyTrends;

//         public int getMonths() { return months; }
//         public void setMonths(int months) { this.months = months; }
//         public String getFromDate() { return fromDate; }
//         public void setFromDate(String fromDate) { this.fromDate = fromDate; }
//         public String getToDate() { return toDate; }
//         public void setToDate(String toDate) { this.toDate = toDate; }
//         public long getTotalCompletedAppointments() { return totalCompletedAppointments; }
//         public void setTotalCompletedAppointments(long totalCompletedAppointments) { this.totalCompletedAppointments = totalCompletedAppointments; }
//         public double getTotalRevenue() { return totalRevenue; }
//         public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
//         public List<DoctorRevenueMetric> getTopDoctors() { return topDoctors; }
//         public void setTopDoctors(List<DoctorRevenueMetric> topDoctors) { this.topDoctors = topDoctors; }
//         public List<MonthlyMetric> getMonthlyTrends() { return monthlyTrends; }
//         public void setMonthlyTrends(List<MonthlyMetric> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
//     }

//     static class PendingDoctorDetails {
//         private Integer id;
//         private String name;
//         private String email;
//         private String phone;
//         private UserStatus status;
//         private boolean approved;
//         private LocalDateTime createdAt;
//         private Long specializationId;
//         private String specialization;
//         private Integer experience;
//         private String clinicAddress;
//         private String qualification;
//         private String bio;
//         private BigDecimal consultationFee;
//         private String licenseCertificateUrl;

//         static PendingDoctorDetails from(User user, DoctorDetails details, String specializationName) {
//             PendingDoctorDetails dto = new PendingDoctorDetails();
//             dto.setId(user.getId());
//             dto.setName(user.getName());
//             dto.setEmail(user.getEmail());
//             dto.setPhone(user.getPhone());
//             dto.setStatus(user.getStatus());
//             dto.setApproved(details != null && details.isApproved());
//             dto.setCreatedAt(user.getCreatedAt());
//             dto.setSpecializationId(details != null ? details.getSpecializationId() : null);
//             dto.setSpecialization(specializationName);
//             dto.setExperience(details != null ? details.getExperienceYear() : null);
//             dto.setClinicAddress(details != null ? details.getClinicAddress() : null);
//             dto.setQualification(details != null ? details.getQualification() : null);
//             dto.setBio(details != null ? details.getBio() : null);
//             dto.setConsultationFee(details != null ? details.getConsultationFee() : null);
//             dto.setLicenseCertificateUrl(details != null ? details.getLicenseCertificateUrl() : null);
//             return dto;
//         }

//         public Integer getId() { return id; }
//         public void setId(Integer id) { this.id = id; }
//         public String getName() { return name; }
//         public void setName(String name) { this.name = name; }
//         public String getEmail() { return email; }
//         public void setEmail(String email) { this.email = email; }
//         public String getPhone() { return phone; }
//         public void setPhone(String phone) { this.phone = phone; }
//         public UserStatus getStatus() { return status; }
//         public void setStatus(UserStatus status) { this.status = status; }
//         public boolean isApproved() { return approved; }
//         public void setApproved(boolean approved) { this.approved = approved; }
//         public LocalDateTime getCreatedAt() { return createdAt; }
//         public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//         public Long getSpecializationId() { return specializationId; }
//         public void setSpecializationId(Long specializationId) { this.specializationId = specializationId; }
//         public String getSpecialization() { return specialization; }
//         public void setSpecialization(String specialization) { this.specialization = specialization; }
//         public Integer getExperience() { return experience; }
//         public void setExperience(Integer experience) { this.experience = experience; }
//         public String getClinicAddress() { return clinicAddress; }
//         public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }
//         public String getQualification() { return qualification; }
//         public void setQualification(String qualification) { this.qualification = qualification; }
//         public String getBio() { return bio; }
//         public void setBio(String bio) { this.bio = bio; }
//         public BigDecimal getConsultationFee() { return consultationFee; }
//         public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }
//         public String getLicenseCertificateUrl() { return licenseCertificateUrl; }
//         public void setLicenseCertificateUrl(String licenseCertificateUrl) { this.licenseCertificateUrl = licenseCertificateUrl; }
//     }

//     /**
//      * =============================================
//      * HELPER METHODS
//      * =============================================
//      */

//     private User getCurrentUserOrNull() {
//         try {
//             Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//             if (authentication == null) return null;
//             String username = authentication.getName();
//             if (username == null) return null;
//             return userService.getUserByEmail(username);
//         } catch (Exception ex) {
//             return null;
//         }
//     }

//     private PendingDoctorDetails mapDoctorWithDetails(User user) {
//         DoctorDetails details = doctorDetailsRepository.findByUserId(user.getId()).orElse(null);
//         String specializationName = null;
//         Long specializationId = details != null ? details.getSpecializationId() : null;
//         if (specializationId != null && specializationId > 0) {
//             specializationName = specializationsRepository.findById(specializationId)
//                     .map(Specializations::getName)
//                     .orElse(null);
//         }
//         return PendingDoctorDetails.from(user, details, specializationName);
//     }    
// }


package com.medicareplus.Controller;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Models.Specializations;
import com.medicareplus.Repository.AppointmentRepository;
import com.medicareplus.Repository.DoctorDetailsRepository;
import com.medicareplus.Repository.LabAppointmentRepository;
import com.medicareplus.Repository.SpecializationsRepository;
import com.medicareplus.Service.UserService;
import com.medicareplus.Service.AdminActivityService;
import com.medicareplus.Service.OtpService;
import com.medicareplus.DTO.OtpVerificationRequest;
import com.medicareplus.DTO.VerificationRequestDTO;
import com.medicareplus.DTO.VerificationResponseDTO;
import com.medicareplus.DTO.PatientInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AdminActivityService adminActivityService;
    private final DoctorDetailsRepository doctorDetailsRepository;
    private final SpecializationsRepository specializationsRepository;
    private final AppointmentRepository appointmentRepository;
    private final LabAppointmentRepository labAppointmentRepository;
    private final OtpService otpService;

    /**
     * =============================================
     * SIMPLIFIED PATIENT VERIFICATION - JUST DB CHECK
     * =============================================
     */

    @PostMapping("/verify-patient")
    public ResponseEntity<?> verifyPatient(@RequestBody VerificationRequestDTO request) {
        try {
            // Check if user exists by email
            User user = userService.getUserByEmail(request.getEmail());
            
            if (user == null) {
                return ResponseEntity.ok(new VerificationResponseDTO(
                    false, 
                    "User not found. Please register first.",
                    null
                ));
            }
            
            // Check if user has PATIENT role
            if (user.getRole() != UserRole.PATIENT) {
                return ResponseEntity.ok(new VerificationResponseDTO(
                    false,
                    "This email is registered as a " + user.getRole() + ". Please use a patient account.",
                    null
                ));
            }
            
            // Check if user is ACTIVE
            if (user.getStatus() != UserStatus.ACTIVE) {
                return ResponseEntity.ok(new VerificationResponseDTO(
                    false,
                    "Your account is " + user.getStatus() + ". Please contact support.",
                    null
                ));
            }
            
            // User exists in database - return user details
            PatientInfoDTO patientInfo = new PatientInfoDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                user.getRole(),
                user.isVerified()
            );
            
            return ResponseEntity.ok(new VerificationResponseDTO(
                true,
                "User verified successfully",
                patientInfo
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new VerificationResponseDTO(
                    false,
                    "Error verifying user: " + e.getMessage(),
                    null
                ));
        }
    }

    @GetMapping("/check-patient")
    public ResponseEntity<?> checkPatientExists(@RequestParam String email) {
        try {
            boolean exists = userService.existsByEmail(email);
            if (exists) {
                User user = userService.getUserByEmail(email);
                
                // Only return if it's a PATIENT
                if (user.getRole() == UserRole.PATIENT) {
                    return ResponseEntity.ok(Map.of(
                        "exists", true,
                        "name", user.getName(),
                        "verified", user.isVerified(),
                        "status", user.getStatus(),
                        "id", user.getId(),
                        "phone", user.getPhone()
                    ));
                } else {
                    return ResponseEntity.ok(Map.of(
                        "exists", true,
                        "isPatient", false,
                        "role", user.getRole()
                    ));
                }
            } else {
                return ResponseEntity.ok(Map.of(
                    "exists", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * =============================================
     * REGISTRATION ENDPOINTS WITH OTP VERIFICATION
     * =============================================
     */

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@RequestBody User user) {
        try {
            user.setRole(UserRole.PATIENT);
            User registeredUser = otpService.registerUser(
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getPhone(),
                user.getRole()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration successful! Please check your email for OTP.",
                "userId", registeredUser.getId(),
                "email", registeredUser.getEmail(),
                "name", registeredUser.getName(),
                "phone", registeredUser.getPhone(),
                "verified", registeredUser.isVerified(),
                "role", registeredUser.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody User user) {
        try {
            user.setRole(UserRole.DOCTOR);
            User registeredUser = otpService.registerUser(
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getPhone(),
                user.getRole()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration successful! Please check your email for OTP.",
                "userId", registeredUser.getId(),
                "email", registeredUser.getEmail(),
                "name", registeredUser.getName(),
                "phone", registeredUser.getPhone(),
                "verified", registeredUser.isVerified(),
                "role", registeredUser.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/register/lab")
    public ResponseEntity<?> registerLab(@RequestBody User user) {
        try {
            user.setRole(UserRole.LAB);
            User registeredUser = otpService.registerUser(
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getPhone(),
                user.getRole()
            );
            userService.updateUserStatus(registeredUser.getId(), UserStatus.PENDING_APPROVAL);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration successful! Please check your email for OTP.",
                "userId", registeredUser.getId(),
                "email", registeredUser.getEmail(),
                "name", registeredUser.getName(),
                "phone", registeredUser.getPhone(),
                "verified", registeredUser.isVerified(),
                "role", registeredUser.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        try {
            user.setRole(UserRole.ADMIN);
            user.setVerified(true);
            
            User registeredUser = userService.registerAdmin(user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Admin registration successful!",
                "userId", registeredUser.getId(),
                "email", registeredUser.getEmail(),
                "name", registeredUser.getName(),
                "verified", registeredUser.isVerified(),
                "role", registeredUser.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * =============================================
     * OTP VERIFICATION ENDPOINTS
     * =============================================
     */

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        try {
            boolean verified = otpService.verifyOtp(
                request.getEmail(), 
                request.getOtp()
            );
            
            if (verified) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email verified successfully! You can now login.",
                    "email", request.getEmail()
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Verification failed"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        try {
            otpService.resendOtp(email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "New OTP sent successfully. Please check your email.",
                "email", email
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus(@RequestParam String email) {
        try {
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "verified", user.isVerified(),
                "name", user.getName(),
                "role", user.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "User not found"));
        }
    }

    /**
     * =============================================
     * EXISTING ADMIN/DOCTOR MANAGEMENT ENDPOINTS
     * =============================================
     */

    @GetMapping("/admins")
    public ResponseEntity<List<User>> getAllAdmins() {
        List<User> admins = userService.getUsersByRole(UserRole.ADMIN);
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<User>> getPendingDoctors() {
        List<User> pendingDoctors = userService.getPendingDoctors();
        return ResponseEntity.ok(pendingDoctors);
    }

    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<?> approveDoctor(@PathVariable Integer id) {
        try {
            User approvedDoctor = userService.approveDoctor(id);
            User actor = getCurrentUserOrNull();
            
            Long doctorIdLong = approvedDoctor.getId() != null ? approvedDoctor.getId().longValue() : null;
            
            adminActivityService.log(
                    "DOCTOR_APPROVED",
                    "Doctor approved: " + approvedDoctor.getName(),
                    actor != null ? actor.getRole().name() : "ADMIN",
                    actor != null ? actor.getId() : null,
                    actor != null ? actor.getName() : "Admin",
                    "DOCTOR",
                    doctorIdLong
            );
            return ResponseEntity.ok(approvedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<User> rejectDoctor(@PathVariable Integer id) {
        User rejectedDoctor = userService.updateUserStatus(id, UserStatus.SUSPENDED);
        User actor = getCurrentUserOrNull();
        adminActivityService.log(
                "DOCTOR_REJECTED",
                "Doctor rejected: " + rejectedDoctor.getName(),
                actor != null ? actor.getRole().name() : "ADMIN",
                actor != null ? actor.getId() : null,
                actor != null ? actor.getName() : "Admin",
                "DOCTOR",
                rejectedDoctor.getId().longValue()
        );
        return ResponseEntity.ok(rejectedDoctor);
    }

    @GetMapping("/doctors/pending/details")
    public ResponseEntity<List<PendingDoctorDetails>> getPendingDoctorsWithDetails() {
        List<PendingDoctorDetails> result = userService.getPendingDoctors()
                .stream()
                .map(this::mapDoctorWithDetails)
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/doctors/details")
    public ResponseEntity<List<PendingDoctorDetails>> getAllDoctorsWithDetails() {
        List<PendingDoctorDetails> result = userService.getUsersByRole(UserRole.DOCTOR)
                .stream()
                .map(this::mapDoctorWithDetails)
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}/active")
    public ResponseEntity<List<User>> getActiveUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.getActiveUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<User> getUserByPhone(@PathVariable String phone) {
        User user = userService.getUserByPhone(phone);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Integer id, @RequestParam UserStatus status) {
        User updatedUser = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalUsers() {
        return ResponseEntity.ok(userService.getTotalUsers());
    }

    @GetMapping("/count/role/{role}")
    public ResponseEntity<Long> getCountByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(userService.getCountByRole(role));
    }

    /**
     * =============================================
     * STATISTICS & ANALYTICS ENDPOINTS
     * =============================================
     */

    @GetMapping("/stats")
    public ResponseEntity<UserStats> getUserStats() {
        UserStats stats = new UserStats();
        stats.setTotalUsers(userService.getTotalUsers());
        stats.setTotalPatients(userService.getCountByRole(UserRole.PATIENT));
        stats.setTotalDoctors(userService.getCountByRole(UserRole.DOCTOR));
        stats.setTotalAdmins(userService.getCountByRole(UserRole.ADMIN));
        stats.setPendingDoctors((long) userService.getPendingDoctors().size());

        int trendWindowDays = 30;
        LocalDateTime threshold = LocalDate.now().minusDays(trendWindowDays - 1L).atStartOfDay();

        List<User> allUsers = userService.getAllUsers();
        List<User> patients = userService.getUsersByRole(UserRole.PATIENT);
        List<User> doctors = userService.getUsersByRole(UserRole.DOCTOR);

        long newUsers = allUsers.stream()
                .map(User::getCreatedAt)
                .filter(Objects::nonNull)
                .filter(dt -> !dt.isBefore(threshold))
                .count();
        long newPatients = patients.stream()
                .map(User::getCreatedAt)
                .filter(Objects::nonNull)
                .filter(dt -> !dt.isBefore(threshold))
                .count();
        long newDoctors = doctors.stream()
                .map(User::getCreatedAt)
                .filter(Objects::nonNull)
                .filter(dt -> !dt.isBefore(threshold))
                .count();

        stats.setAverageDailyUsers(newUsers / (double) trendWindowDays);
        stats.setAverageDailyPatients(newPatients / (double) trendWindowDays);
        stats.setAverageDailyDoctors(newDoctors / (double) trendWindowDays);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<AnalyticsOverview> getAnalyticsOverview(
            @RequestParam(defaultValue = "7") Integer days) {
        int safeDays = Math.max(1, Math.min(days, 90));
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(safeDays - 1L);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime tomorrowStart = today.plusDays(1).atStartOfDay();

        List<User> allUsers = userService.getAllUsers();
        List<Appointment> rangeAppointments = appointmentRepository.findByCreatedAtBetween(startDateTime, tomorrowStart);
        List<Appointment> allAppointments = appointmentRepository.findAll();
        List<com.medicareplus.Models.LabAppointment> labRangeAppointments =
                labAppointmentRepository.findByCreatedAtBetween(startDateTime, tomorrowStart);

        Map<LocalDate, Long> dailyUsers = new LinkedHashMap<>();
        Map<LocalDate, Long> dailyAppointments = new LinkedHashMap<>();
        Map<LocalDate, Long> dailyLabAppointments = new LinkedHashMap<>();
        for (int i = 0; i < safeDays; i++) {
            LocalDate d = startDate.plusDays(i);
            dailyUsers.put(d, 0L);
            dailyAppointments.put(d, 0L);
            dailyLabAppointments.put(d, 0L);
        }

        for (User user : allUsers) {
            if (user.getCreatedAt() == null) {
                continue;
            }
            LocalDateTime createdAt = user.getCreatedAt();
            if (!createdAt.isBefore(startDateTime) && createdAt.isBefore(tomorrowStart)) {
                LocalDate date = createdAt.toLocalDate();
                dailyUsers.computeIfPresent(date, (k, v) -> v + 1L);
            }
        }

        long pendingAppointments = 0L;
        long confirmedAppointments = 0L;
        long completedAppointments = 0L;
        long cancelledAppointments = 0L;
        double revenueInRange = 0.0;

        for (Appointment appointment : rangeAppointments) {
            LocalDateTime createdAt = appointment.getCreatedAt();
            if (createdAt != null) {
                LocalDate createdDate = createdAt.toLocalDate();
                dailyAppointments.computeIfPresent(createdDate, (k, v) -> v + 1L);
            }
            if (appointment.getStatus() == AppointmentStatus.PENDING) pendingAppointments++;
            if (appointment.getStatus() == AppointmentStatus.CONFIRMED) confirmedAppointments++;
            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                completedAppointments++;
                revenueInRange += appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0;
            }
            if (appointment.getStatus() == AppointmentStatus.CANCELLED) cancelledAppointments++;
        }

        double totalRevenue = 0.0;
        for (Appointment appointment : allAppointments) {
            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                totalRevenue += appointment.getConsultationFee() != null ? appointment.getConsultationFee() : 0.0;
            }
        }

        long rangeLabAppointments = 0L;
        for (com.medicareplus.Models.LabAppointment appointment : labRangeAppointments) {
            LocalDateTime createdAt = appointment.getCreatedAt();
            if (createdAt != null) {
                LocalDate createdDate = createdAt.toLocalDate();
                dailyLabAppointments.computeIfPresent(createdDate, (k, v) -> v + 1L);
                rangeLabAppointments++;
            }
        }
        long totalLabAppointments = labAppointmentRepository.count();

        long activeDoctors = userService.getUsersByRole(UserRole.DOCTOR).stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .count();

        long newUsersToday = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().toLocalDate().isEqual(today))
                .count();

        AnalyticsOverview overview = new AnalyticsOverview();
        overview.setDays(safeDays);
        overview.setTotalUsers(allUsers.size());
        overview.setTotalAppointments((long) allAppointments.size());
        overview.setRangeAppointments((long) rangeAppointments.size());
        overview.setPendingAppointments(pendingAppointments);
        overview.setConfirmedAppointments(confirmedAppointments);
        overview.setCompletedAppointments(completedAppointments);
        overview.setCancelledAppointments(cancelledAppointments);
        overview.setActiveDoctors(activeDoctors);
        overview.setNewUsersToday(newUsersToday);
        overview.setTotalRevenue(totalRevenue);
        overview.setRevenueInRange(revenueInRange);
        overview.setTotalLabAppointments(totalLabAppointments);
        overview.setRangeLabAppointments(rangeLabAppointments);

        List<DailyMetric> userSeries = new ArrayList<>();
        dailyUsers.forEach((date, count) -> userSeries.add(new DailyMetric(date.toString(), count)));
        List<DailyMetric> appointmentSeries = new ArrayList<>();
        dailyAppointments.forEach((date, count) -> appointmentSeries.add(new DailyMetric(date.toString(), count)));
        List<DailyMetric> labAppointmentSeries = new ArrayList<>();
        dailyLabAppointments.forEach((date, count) -> labAppointmentSeries.add(new DailyMetric(date.toString(), count)));
        overview.setDailyRegistrations(userSeries);
        overview.setDailyAppointments(appointmentSeries);
        overview.setDailyLabAppointments(labAppointmentSeries);

        return ResponseEntity.ok(overview);
    }

    @GetMapping("/analytics/detailed")
    public ResponseEntity<DetailedAnalyticsOverview> getDetailedAnalytics(
            @RequestParam(defaultValue = "6") Integer months) {
        int safeMonths = Math.max(1, Math.min(months, 24));
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusMonths(safeMonths - 1L).withDayOfMonth(1);

        List<Object[]> doctorRows = appointmentRepository.getDoctorRevenueSummary(startDate, today);
        List<Object[]> monthlyRows = appointmentRepository.getMonthlyRevenueSummary(startDate, today);

        Map<YearMonth, MonthlyMetric> monthlyMap = new LinkedHashMap<>();
        YearMonth startYm = YearMonth.from(startDate);
        YearMonth endYm = YearMonth.from(today);
        YearMonth cursor = startYm;
        while (!cursor.isAfter(endYm)) {
            MonthlyMetric mm = new MonthlyMetric();
            mm.setMonth(cursor.toString());
            mm.setAppointments(0L);
            mm.setRevenue(0.0);
            monthlyMap.put(cursor, mm);
            cursor = cursor.plusMonths(1);
        }

        for (Object[] row : monthlyRows) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long appointments = ((Number) row[2]).longValue();
            double revenue = ((Number) row[3]).doubleValue();
            YearMonth ym = YearMonth.of(year, month);
            MonthlyMetric existing = monthlyMap.get(ym);
            if (existing != null) {
                existing.setAppointments(appointments);
                existing.setRevenue(revenue);
            }
        }

        double totalRevenue = doctorRows.stream()
                .mapToDouble(row -> ((Number) row[3]).doubleValue())
                .sum();
        long totalCompletedAppointments = doctorRows.stream()
                .mapToLong(row -> ((Number) row[2]).longValue())
                .sum();

        List<DoctorRevenueMetric> topDoctors = doctorRows.stream()
                .map(row -> {
                    DoctorRevenueMetric metric = new DoctorRevenueMetric();
                    metric.setDoctorId(((Number) row[0]).intValue());
                    metric.setDoctorName((String) row[1]);
                    metric.setCompletedAppointments(((Number) row[2]).longValue());
                    metric.setRevenue(((Number) row[3]).doubleValue());
                    return metric;
                })
                .sorted(Comparator.comparingDouble(DoctorRevenueMetric::getRevenue).reversed())
                .limit(10)
                .toList();

        DetailedAnalyticsOverview detailed = new DetailedAnalyticsOverview();
        detailed.setMonths((int) monthlyMap.size());
        detailed.setFromDate(startDate.toString());
        detailed.setToDate(today.toString());
        detailed.setTopDoctors(topDoctors);
        detailed.setMonthlyTrends(new ArrayList<>(monthlyMap.values()));
        detailed.setTotalRevenue(totalRevenue);
        detailed.setTotalCompletedAppointments(totalCompletedAppointments);
        return ResponseEntity.ok(detailed);
    }

    /**
     * =============================================
     * INNER CLASSES
     * =============================================
     */

    static class UserStats {
        private long totalUsers;
        private long totalPatients;
        private long totalDoctors;
        private long totalAdmins;
        private long pendingDoctors;
        private double averageDailyUsers;
        private double averageDailyPatients;
        private double averageDailyDoctors;

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getTotalPatients() { return totalPatients; }
        public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }
        public long getTotalDoctors() { return totalDoctors; }
        public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }
        public long getTotalAdmins() { return totalAdmins; }
        public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }
        public long getPendingDoctors() { return pendingDoctors; }
        public void setPendingDoctors(long pendingDoctors) { this.pendingDoctors = pendingDoctors; }
        public double getAverageDailyUsers() { return averageDailyUsers; }
        public void setAverageDailyUsers(double averageDailyUsers) { this.averageDailyUsers = averageDailyUsers; }
        public double getAverageDailyPatients() { return averageDailyPatients; }
        public void setAverageDailyPatients(double averageDailyPatients) { this.averageDailyPatients = averageDailyPatients; }
        public double getAverageDailyDoctors() { return averageDailyDoctors; }
        public void setAverageDailyDoctors(double averageDailyDoctors) { this.averageDailyDoctors = averageDailyDoctors; }
    }

    static class DailyMetric {
        private String date;
        private long count;

        DailyMetric(String date, long count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    static class AnalyticsOverview {
        private int days;
        private long totalUsers;
        private long totalAppointments;
        private long totalLabAppointments;
        private long rangeAppointments;
        private long rangeLabAppointments;
        private long pendingAppointments;
        private long confirmedAppointments;
        private long completedAppointments;
        private long cancelledAppointments;
        private long activeDoctors;
        private long newUsersToday;
        private double totalRevenue;
        private double revenueInRange;
        private List<DailyMetric> dailyRegistrations;
        private List<DailyMetric> dailyAppointments;
        private List<DailyMetric> dailyLabAppointments;

        public int getDays() { return days; }
        public void setDays(int days) { this.days = days; }
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getTotalAppointments() { return totalAppointments; }
        public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }
        public long getTotalLabAppointments() { return totalLabAppointments; }
        public void setTotalLabAppointments(long totalLabAppointments) { this.totalLabAppointments = totalLabAppointments; }
        public long getRangeAppointments() { return rangeAppointments; }
        public void setRangeAppointments(long rangeAppointments) { this.rangeAppointments = rangeAppointments; }
        public long getRangeLabAppointments() { return rangeLabAppointments; }
        public void setRangeLabAppointments(long rangeLabAppointments) { this.rangeLabAppointments = rangeLabAppointments; }
        public long getPendingAppointments() { return pendingAppointments; }
        public void setPendingAppointments(long pendingAppointments) { this.pendingAppointments = pendingAppointments; }
        public long getConfirmedAppointments() { return confirmedAppointments; }
        public void setConfirmedAppointments(long confirmedAppointments) { this.confirmedAppointments = confirmedAppointments; }
        public long getCompletedAppointments() { return completedAppointments; }
        public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }
        public long getCancelledAppointments() { return cancelledAppointments; }
        public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }
        public long getActiveDoctors() { return activeDoctors; }
        public void setActiveDoctors(long activeDoctors) { this.activeDoctors = activeDoctors; }
        public long getNewUsersToday() { return newUsersToday; }
        public void setNewUsersToday(long newUsersToday) { this.newUsersToday = newUsersToday; }
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public double getRevenueInRange() { return revenueInRange; }
        public void setRevenueInRange(double revenueInRange) { this.revenueInRange = revenueInRange; }
        public List<DailyMetric> getDailyRegistrations() { return dailyRegistrations; }
        public void setDailyRegistrations(List<DailyMetric> dailyRegistrations) { this.dailyRegistrations = dailyRegistrations; }
        public List<DailyMetric> getDailyAppointments() { return dailyAppointments; }
        public void setDailyAppointments(List<DailyMetric> dailyAppointments) { this.dailyAppointments = dailyAppointments; }
        public List<DailyMetric> getDailyLabAppointments() { return dailyLabAppointments; }
        public void setDailyLabAppointments(List<DailyMetric> dailyLabAppointments) { this.dailyLabAppointments = dailyLabAppointments; }
    }

    static class DoctorRevenueMetric {
        private Integer doctorId;
        private String doctorName;
        private long completedAppointments;
        private double revenue;

        public Integer getDoctorId() { return doctorId; }
        public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
        public long getCompletedAppointments() { return completedAppointments; }
        public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }
        public double getRevenue() { return revenue; }
        public void setRevenue(double revenue) { this.revenue = revenue; }
    }

    static class MonthlyMetric {
        private String month;
        private long appointments;
        private double revenue;

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public long getAppointments() { return appointments; }
        public void setAppointments(long appointments) { this.appointments = appointments; }
        public double getRevenue() { return revenue; }
        public void setRevenue(double revenue) { this.revenue = revenue; }
    }

    static class DetailedAnalyticsOverview {
        private int months;
        private String fromDate;
        private String toDate;
        private long totalCompletedAppointments;
        private double totalRevenue;
        private List<DoctorRevenueMetric> topDoctors;
        private List<MonthlyMetric> monthlyTrends;

        public int getMonths() { return months; }
        public void setMonths(int months) { this.months = months; }
        public String getFromDate() { return fromDate; }
        public void setFromDate(String fromDate) { this.fromDate = fromDate; }
        public String getToDate() { return toDate; }
        public void setToDate(String toDate) { this.toDate = toDate; }
        public long getTotalCompletedAppointments() { return totalCompletedAppointments; }
        public void setTotalCompletedAppointments(long totalCompletedAppointments) { this.totalCompletedAppointments = totalCompletedAppointments; }
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public List<DoctorRevenueMetric> getTopDoctors() { return topDoctors; }
        public void setTopDoctors(List<DoctorRevenueMetric> topDoctors) { this.topDoctors = topDoctors; }
        public List<MonthlyMetric> getMonthlyTrends() { return monthlyTrends; }
        public void setMonthlyTrends(List<MonthlyMetric> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
    }

    static class PendingDoctorDetails {
        private Integer id;
        private String name;
        private String email;
        private String phone;
        private UserStatus status;
        private boolean approved;
        private LocalDateTime createdAt;
        private Long specializationId;
        private String specialization;
        private Integer experience;
        private String clinicAddress;
        private String qualification;
        private String bio;
        private BigDecimal consultationFee;
        private String licenseCertificateUrl;

        static PendingDoctorDetails from(User user, DoctorDetails details, String specializationName) {
            PendingDoctorDetails dto = new PendingDoctorDetails();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setStatus(user.getStatus());
            dto.setApproved(details != null && details.isApproved());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setSpecializationId(details != null ? details.getSpecializationId() : null);
            dto.setSpecialization(specializationName);
            dto.setExperience(details != null ? details.getExperienceYear() : null);
            dto.setClinicAddress(details != null ? details.getClinicAddress() : null);
            dto.setQualification(details != null ? details.getQualification() : null);
            dto.setBio(details != null ? details.getBio() : null);
            dto.setConsultationFee(details != null ? details.getConsultationFee() : null);
            dto.setLicenseCertificateUrl(details != null ? details.getLicenseCertificateUrl() : null);
            return dto;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public boolean isApproved() { return approved; }
        public void setApproved(boolean approved) { this.approved = approved; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Long getSpecializationId() { return specializationId; }
        public void setSpecializationId(Long specializationId) { this.specializationId = specializationId; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public Integer getExperience() { return experience; }
        public void setExperience(Integer experience) { this.experience = experience; }
        public String getClinicAddress() { return clinicAddress; }
        public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }
        public String getQualification() { return qualification; }
        public void setQualification(String qualification) { this.qualification = qualification; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public BigDecimal getConsultationFee() { return consultationFee; }
        public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }
        public String getLicenseCertificateUrl() { return licenseCertificateUrl; }
        public void setLicenseCertificateUrl(String licenseCertificateUrl) { this.licenseCertificateUrl = licenseCertificateUrl; }
    }

    /**
     * =============================================
     * HELPER METHODS
     * =============================================
     */

    private User getCurrentUserOrNull() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) return null;
            String username = authentication.getName();
            if (username == null) return null;
            return userService.getUserByEmail(username);
        } catch (Exception ex) {
            return null;
        }
    }

    private PendingDoctorDetails mapDoctorWithDetails(User user) {
        DoctorDetails details = doctorDetailsRepository.findByUserId(user.getId()).orElse(null);
        String specializationName = null;
        Long specializationId = details != null ? details.getSpecializationId() : null;
        if (specializationId != null && specializationId > 0) {
            specializationName = specializationsRepository.findById(specializationId)
                    .map(Specializations::getName)
                    .orElse(null);
        }
        return PendingDoctorDetails.from(user, details, specializationName);
    }


    
}

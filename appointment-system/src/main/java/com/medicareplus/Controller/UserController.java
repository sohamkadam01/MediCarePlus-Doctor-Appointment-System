package com.medicareplus.Controller;

import java.util.List;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Models.Specializations;
import com.medicareplus.Repository.DoctorDetailsRepository;
import com.medicareplus.Repository.SpecializationsRepository;
import com.medicareplus.Service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final DoctorDetailsRepository doctorDetailsRepository;
    private final SpecializationsRepository specializationsRepository;

    @PostMapping("/register/patient")
    public ResponseEntity<User> registerPatient(@RequestBody User user) {
        User registeredUser = userService.registerPatient(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<User> registerDoctor(@RequestBody User user) {
        User registeredUser = userService.registerDoctor(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/register/admin")
    public ResponseEntity<User> registerAdmin(@RequestBody User user) {
        User registeredUser = userService.registerAdmin(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

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
    public ResponseEntity<User> approveDoctor(@PathVariable Integer id) {
        User approvedDoctor = userService.approveDoctor(id);
        return ResponseEntity.ok(approvedDoctor);
    }

    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<User> rejectDoctor(@PathVariable Integer id) {
        User rejectedDoctor = userService.updateUserStatus(id, UserStatus.SUSPENDED);
        return ResponseEntity.ok(rejectedDoctor);
    }

    @GetMapping("/doctors/pending/details")
    public ResponseEntity<List<PendingDoctorDetails>> getPendingDoctorsWithDetails() {
        List<PendingDoctorDetails> result = userService.getPendingDoctors()
                .stream()
                .map(user -> {
                    DoctorDetails details = doctorDetailsRepository.findByUserId(user.getId()).orElse(null);
                    String specializationName = null;
                    Long specializationId = details != null ? details.getSpecializationId() : null;
                    if (specializationId != null && specializationId > 0) {
                        specializationName = specializationsRepository.findById(specializationId)
                                .map(Specializations::getName)
                                .orElse(null);
                    }
                    return PendingDoctorDetails.from(user, details, specializationName);
                })
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

    @GetMapping("/stats")
    public ResponseEntity<UserStats> getUserStats() {
        UserStats stats = new UserStats();
        stats.setTotalUsers(userService.getTotalUsers());
        stats.setTotalPatients(userService.getCountByRole(UserRole.PATIENT));
        stats.setTotalDoctors(userService.getCountByRole(UserRole.DOCTOR));
        stats.setTotalAdmins(userService.getCountByRole(UserRole.ADMIN));
        stats.setPendingDoctors((long) userService.getPendingDoctors().size());
        return ResponseEntity.ok(stats);
    }

    static class UserStats {
        private long totalUsers;
        private long totalPatients;
        private long totalDoctors;
        private long totalAdmins;
        private long pendingDoctors;

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
    }

    static class PendingDoctorDetails {
        private Integer id;
        private String name;
        private String email;
        private String phone;
        private UserStatus status;
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
}

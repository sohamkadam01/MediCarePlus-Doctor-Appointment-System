package com.medicareplus.Controller;

import com.medicareplus.DTO.LabEnrollmentResponseDTO;
import com.medicareplus.Models.AdminActivityLog;
import com.medicareplus.Models.User;
import com.medicareplus.Service.AdminActivityService;
import com.medicareplus.Service.LabEnrollmentService;
import com.medicareplus.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminActivityService adminActivityService;
    private final UserService userService;
    private final LabEnrollmentService labEnrollmentService;

    @GetMapping("/activities")
    public ResponseEntity<List<ActivityResponse>> getRecentActivities() {
        List<ActivityResponse> activities = adminActivityService.getRecentActivities().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<ActivityResponse>> getNotifications() {
        List<ActivityResponse> notifications = adminActivityService.getUnreadNotifications().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(notifications);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUserByAdmin(@PathVariable Integer id) {
        User target = userService.getUserById(id);
        User actor = getCurrentUser();
        userService.deleteUser(id);
        adminActivityService.log(
                "USER_DELETED",
                "Admin deleted " + target.getRole() + " user: " + target.getName(),
                actor.getRole().name(),
                actor.getId(),
                actor.getName(),
                "USER",
                id.longValue()
        );
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/lab-enrollments/{id}/approve")
    public ResponseEntity<LabEnrollmentResponseDTO> approveLabEnrollment(@PathVariable Integer id) {
        LabEnrollmentResponseDTO approved = labEnrollmentService.approveEnrollment(id);
        User actor = getCurrentUser();
        adminActivityService.log(
                "LAB_APPROVED",
                "Lab approved: " + approved.getLabName(),
                actor.getRole().name(),
                actor.getId(),
                actor.getName(),
                "LAB_ENROLLMENT",
                id.longValue()
        );
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/lab-enrollments/{id}/reject")
    public ResponseEntity<LabEnrollmentResponseDTO> rejectLabEnrollment(@PathVariable Integer id) {
        LabEnrollmentResponseDTO rejected = labEnrollmentService.rejectEnrollment(id);
        User actor = getCurrentUser();
        adminActivityService.log(
                "LAB_REJECTED",
                "Lab rejected: " + rejected.getLabName(),
                actor.getRole().name(),
                actor.getId(),
                actor.getName(),
                "LAB_ENROLLMENT",
                id.longValue()
        );
        return ResponseEntity.ok(rejected);
    }

    private ActivityResponse toResponse(AdminActivityLog log) {
        ActivityResponse response = new ActivityResponse();
        response.setDescription(log.getDescription());
        response.setType(log.getActivityType());
        response.setUnread(log.isUnread());
        response.setTime(formatRelative(log.getCreatedAt()));
        return response;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByEmail(username);
    }

    private String formatRelative(LocalDateTime timestamp) {
        if (timestamp == null) return "just now";
        Duration duration = Duration.between(timestamp, LocalDateTime.now());
        long minutes = duration.toMinutes();
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = duration.toHours();
        if (hours < 24) return hours + "h ago";
        long days = duration.toDays();
        return days + "d ago";
    }

    static class ActivityResponse {
        private String description;
        private String type;
        private String time;
        private boolean unread;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public boolean isUnread() { return unread; }
        public void setUnread(boolean unread) { this.unread = unread; }
    }
}

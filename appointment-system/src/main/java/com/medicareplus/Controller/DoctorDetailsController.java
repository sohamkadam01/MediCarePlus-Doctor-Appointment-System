package com.medicareplus.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.medicareplus.DTO.DoctorDetailsRequestDTO;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Service.DoctorDetailsService;
import com.medicareplus.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors/details")
@RequiredArgsConstructor
public class DoctorDetailsController {

    private final DoctorDetailsService doctorDetailsService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getUserByEmail(authentication.getName());
    }

    private boolean canModifyDoctorDetails(User actor, Integer targetUserId) {
        if (actor == null || targetUserId == null) return false;
        if (actor.getRole() == UserRole.ADMIN) return true;
        return actor.getRole() == UserRole.DOCTOR && actor.getId().equals(targetUserId);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(doctorDetailsService.findByUserIdOrNull(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> create(@PathVariable Integer userId, @Valid @RequestBody DoctorDetailsRequestDTO payload) {
        try {
            User actor = getCurrentUser();
            if (!canModifyDoctorDetails(actor, userId)) {
                return ResponseEntity.status(403).body("Access denied");
            }
            return ResponseEntity.ok(doctorDetailsService.saveOrUpdate(userId, payload));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> update(@PathVariable Integer userId, @Valid @RequestBody DoctorDetailsRequestDTO payload) {
        try {
            User actor = getCurrentUser();
            if (!canModifyDoctorDetails(actor, userId)) {
                return ResponseEntity.status(403).body("Access denied");
            }
            return ResponseEntity.ok(doctorDetailsService.saveOrUpdate(userId, payload));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
}

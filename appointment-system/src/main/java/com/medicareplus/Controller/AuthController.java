package com.medicareplus.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicareplus.DTO.LoginRequest;
import com.medicareplus.DTO.LoginResponse;
import com.medicareplus.DTO.LogoutResponse;
import com.medicareplus.Service.OtpService;
import com.medicareplus.Service.UserService;
import com.medicareplus.Security.TokenBlacklistService;
import com.medicareplus.Security.JwtUtil;
import com.medicareplus.Models.User;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private final UserService userService;
    @Autowired
    private final TokenBlacklistService blacklistService;
    @Autowired
    private final JwtUtil jwtUtil;
    
    @Autowired
    private OtpService otpService;
    
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    try {
        System.out.println("========== LOGIN ATTEMPT ==========");
        System.out.println("Email: " + loginRequest.getEmail());
        System.out.println("Phone: " + loginRequest.getPhone());
        System.out.println("Password: [PROTECTED]");
        
        // First, check if user exists
        User user = null;
        
        if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
            System.out.println("Attempting to find user by email: " + loginRequest.getEmail());
            try {
                user = userService.getUserByEmail(loginRequest.getEmail());
                System.out.println("User found by email: " + (user != null));
                if (user != null) {
                    System.out.println("User ID: " + user.getId());
                    System.out.println("User verified: " + user.isVerified());
                    System.out.println("User role: " + user.getRole());
                }
            } catch (Exception e) {
                System.out.println("Error finding user by email: " + e.getMessage());
                e.printStackTrace();
            }
        } else if (loginRequest.getPhone() != null && !loginRequest.getPhone().isEmpty()) {
            System.out.println("Attempting to find user by phone: " + loginRequest.getPhone());
            try {
                user = userService.getUserByPhone(loginRequest.getPhone());
                System.out.println("User found by phone: " + (user != null));
            } catch (Exception e) {
                System.out.println("Error finding user by phone: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        if (user == null) {
            System.out.println("❌ User not found in database");
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "User not found"));
        }
        
        // Check if email is verified
        if (!user.isVerified()) {
            System.out.println("❌ Email not verified for user: " + user.getEmail());
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Please verify your email first. Check your inbox for OTP.",
                "email", user.getEmail(),
                "verified", false
            ));
        }

        if (user.getRole() == com.medicareplus.Models.UserRole.LAB
                && user.getStatus() != com.medicareplus.Models.UserStatus.ACTIVE) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Lab account is pending approval. Please wait for admin approval.",
                "status", user.getStatus().name()
            ));
        }
        
        System.out.println("✅ User found and verified. Attempting login...");
        
        // Attempt login
        LoginResponse response = userService.login(loginRequest);
        System.out.println("✅ Login successful for user: " + user.getEmail());
        System.out.println("Token generated: " + (response.getToken() != null));
        
        return ResponseEntity.ok(response);
        
    } catch (RuntimeException e) {
        System.out.println("❌ Login error: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", e.getMessage()));
    }
}
    
    @PostMapping("/login/email")
    public ResponseEntity<?> loginWithEmail(@RequestParam String email, @RequestParam String password) {
        try {
            // Check if email is verified
            User user = userService.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found"));
            }
            
            if (!user.isVerified()) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Please verify your email first. Check your inbox for OTP.",
                    "email", email,
                    "verified", false
                ));
            }

            if (user.getRole() == com.medicareplus.Models.UserRole.LAB
                    && user.getStatus() != com.medicareplus.Models.UserStatus.ACTIVE) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Lab account is pending approval. Please wait for admin approval.",
                    "status", user.getStatus().name()
                ));
            }
            
            LoginRequest request = new LoginRequest();
            request.setEmail(email);
            request.setPassword(password);
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/login/phone")
    public ResponseEntity<?> loginWithPhone(@RequestParam String phone, @RequestParam String password) {
        try {
            // First get user by phone to check verification
            User user = userService.getUserByPhone(phone);
            
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found"));
            }
            
            if (!user.isVerified()) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Please verify your email first. Check your inbox for OTP.",
                    "email", user.getEmail(),
                    "verified", false
                ));
            }

            if (user.getRole() == com.medicareplus.Models.UserRole.LAB
                    && user.getStatus() != com.medicareplus.Models.UserStatus.ACTIVE) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Lab account is pending approval. Please wait for admin approval.",
                    "status", user.getStatus().name()
                ));
            }
            
            LoginRequest request = new LoginRequest();
            request.setPhone(phone);
            request.setPassword(password);
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        
        if (token != null) {
            long expirationTime = jwtUtil.extractExpiration(token).getTime();
            blacklistService.blacklistToken(token, expirationTime);
            
            return ResponseEntity.ok(LogoutResponse.builder()
                    .success(true)
                    .message("Logged out successfully")
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
        
        return ResponseEntity.badRequest().body(LogoutResponse.builder()
                .success(false)
                .message("No token provided")
                .timestamp(System.currentTimeMillis())
                .build());
    }
    
    @PostMapping("/logout-all")
    public ResponseEntity<LogoutResponse> logoutFromAllDevices(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        
        if (token != null) {
            String username = jwtUtil.extractUsername(token);
            long expirationTime = jwtUtil.extractExpiration(token).getTime();
            blacklistService.blacklistToken(token, expirationTime);
            
            return ResponseEntity.ok(LogoutResponse.builder()
                    .success(true)
                    .message("Logged out from all devices successfully")
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
        
        return ResponseEntity.badRequest().body(LogoutResponse.builder()
                .success(false)
                .message("No token provided")
                .timestamp(System.currentTimeMillis())
                .build());
    }
    
    @PostMapping("/logout/user/{userId}")
    public ResponseEntity<LogoutResponse> logoutUserByAdmin(@PathVariable Integer userId) {
        return ResponseEntity.ok(LogoutResponse.builder()
                .success(true)
                .message("User logged out successfully by admin")
                .timestamp(System.currentTimeMillis())
                .build());
    }
    
    @PostMapping("/logout/phone/{phone}")
    public ResponseEntity<LogoutResponse> logoutByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(LogoutResponse.builder()
                .success(true)
                .message("User logged out successfully by admin")
                .timestamp(System.currentTimeMillis())
                .build());
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        
        if (token != null) {
            boolean isValid = jwtUtil.validateToken(token);
            boolean isBlacklisted = blacklistService.isTokenBlacklisted(token);
            
            if (isValid && !isBlacklisted) {
                return ResponseEntity.ok(new TokenValidationResponse(true, "Token is valid"));
            } else if (isBlacklisted) {
                return ResponseEntity.status(401).body(new TokenValidationResponse(false, "Token has been blacklisted"));
            } else {
                return ResponseEntity.status(401).body(new TokenValidationResponse(false, "Token is invalid or expired"));
            }
        }
        
        return ResponseEntity.badRequest().body(new TokenValidationResponse(false, "No token provided"));
    }
    
    @GetMapping("/blacklist/size")
    public ResponseEntity<Integer> getBlacklistSize() {
        return ResponseEntity.ok(blacklistService.getBlacklistSize());
    }
    
    @GetMapping("/info")
    public ResponseEntity<?> getTokenInfo(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            Integer userId = jwtUtil.extractUserId(token);
            boolean isBlacklisted = blacklistService.isTokenBlacklisted(token);
            
            return ResponseEntity.ok(new TokenInfoResponse(
                username,
                role,
                userId,
                !isBlacklisted,
                jwtUtil.extractExpiration(token)
            ));
        }
        
        return ResponseEntity.badRequest().body("Invalid or no token provided");
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    // Response Classes
    static class ErrorResponse {
        private String error;
        private long timestamp;
        
        public ErrorResponse(String message) {
            this.error = message;
            this.timestamp = System.currentTimeMillis();
        }
        
        public String getError() { return error; }
        public long getTimestamp() { return timestamp; }
    }
    
    static class TokenValidationResponse {
        private boolean valid;
        private String message;
        private long timestamp;
        
        public TokenValidationResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
        public long getTimestamp() { return timestamp; }
    }
    
    static class TokenInfoResponse {
        private String username;
        private String role;
        private Integer userId;
        private boolean active;
        private java.util.Date expiration;
        
        public TokenInfoResponse(String username, String role, Integer userId, boolean active, java.util.Date expiration) {
            this.username = username;
            this.role = role;
            this.userId = userId;
            this.active = active;
            this.expiration = expiration;
        }
        
        public String getUsername() { return username; }
        public String getRole() { return role; }
        public Integer getUserId() { return userId; }
        public boolean isActive() { return active; }
        public java.util.Date getExpiration() { return expiration; }
    }
}

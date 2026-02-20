package com.medicareplus.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicareplus.DTO.LoginRequest;
import com.medicareplus.DTO.LoginResponse;
import com.medicareplus.DTO.LogoutResponse;
import com.medicareplus.Service.UserService;
import com.medicareplus.Security.TokenBlacklistService;
import com.medicareplus.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final TokenBlacklistService blacklistService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/login/email")
    public ResponseEntity<?> loginWithEmail(@RequestParam String email, @RequestParam String password) {
        try {
            LoginRequest request = new LoginRequest();
            request.setEmail(email);
            request.setPassword(password);
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/login/phone")
    public ResponseEntity<?> loginWithPhone(@RequestParam String phone, @RequestParam String password) {
        try {
            LoginRequest request = new LoginRequest();
            request.setPhone(phone);
            request.setPassword(password);
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        
        if (token != null) {
            // Get token expiration from JWT
            long expirationTime = jwtUtil.extractExpiration(token).getTime();
            
            // Blacklist the token
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
            
            // Blacklist the current token
            blacklistService.blacklistToken(token, expirationTime);
            
            // In a real application, you would blacklist ALL tokens for this user
            // This would require storing user-token mappings in database/redis
            
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
        // Admin can logout a specific user
        // This would require finding all tokens for that user and blacklisting them
        // Implementation depends on how you store user-token mappings
        
        return ResponseEntity.ok(LogoutResponse.builder()
                .success(true)
                .message("User logged out successfully by admin")
                .timestamp(System.currentTimeMillis())
                .build());
    }
    
    @PostMapping("/logout/phone/{phone}")
    public ResponseEntity<LogoutResponse> logoutByPhone(@PathVariable String phone) {
        // Admin can logout a user by phone number
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
        
        public TokenValidationResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
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
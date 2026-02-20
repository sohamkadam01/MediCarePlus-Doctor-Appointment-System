package com.medicareplus.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private UserStatus status;
    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private LocalDateTime loginTime;
    private String message;
}
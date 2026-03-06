// PatientInfoDTO.java
package com.medicareplus.DTO;

import com.medicareplus.Models.UserStatus;
import com.medicareplus.Models.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientInfoDTO {
    private Integer id;
    private String name;
    private String email;
    private String phone;
    private UserStatus status;
    private UserRole role;
    private boolean verified;
}
package com.medicareplus.Config;

import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void createAdmin() {

        if (userRepository.findByRole(UserRole.ADMIN).isEmpty()) {

            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@medicareplus.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setPhone("9999999999");
            admin.setRole(UserRole.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setVerified(true);

            userRepository.save(admin);

            System.out.println("✅ Default Admin Created");
        }
    }
}

package com.medicareplus.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

import javax.management.RuntimeErrorException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Repository.UserRepository;

@Service
public class OtpService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 10;

    private String generateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

public User registerUser(String email, String password, String name, String phone,  UserRole role) {
    System.out.println("=== REGISTERING USER ===");
    System.out.println("Email: " + email);
    System.out.println("Phone: " + phone);
    
    if (userRepository.existsByEmail(email)) {
        throw new RuntimeException("User already exists with this email");
    }
    
    // Check if phone already exists
    try {
        userRepository.findByPhone(phone).ifPresent(u -> {
            throw new RuntimeException("Phone number already registered: " + phone);
        });
    } catch (Exception e) {
        System.out.println("Phone check error: " + e.getMessage());
    }

    User user = new User();
    user.setEmail(email);
    String encodedPassword = passwordEncoder.encode(password);
    user.setPassword(encodedPassword);
    user.setName(name);
    user.setPhone(phone);
    user.setVerified(false);
    user.setRole(role);

    try {
        User savedUser = userRepository.save(user);
        System.out.println("User saved with ID: " + savedUser.getId());
        
        String otp = generateOtp();
        String key = "OTP:" + email;
        redisTemplate.opsForValue().set(key, otp, OTP_EXPIRY_MINUTES, TimeUnit.MINUTES);
        emailService.sendOtpEmail(email, otp);
        
        return savedUser;
    } catch (Exception e) {
        System.out.println("ERROR SAVING USER: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to save user: " + e.getMessage());
    }
}

    public boolean verifyOtp(String email, String enteredOtp) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("Email already verified");
        }

        String key = "OTP:" + email;
        Object storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new RuntimeException("OTP expired or not found");
        }

        if (storedOtp.toString().equals(enteredOtp)) {

            user.setVerified(true);
            userRepository.save(user);

            redisTemplate.delete(key); // Remove OTP after success

            return true;
        } else {
            throw new RuntimeException("Invalid OTP");
        }
    }

    public void resendOtp(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.isVerified()) {
        throw new RuntimeException("Email already verified");
    }

    String newOtp = generateOtp();

    String key = "OTP:" + email;

    // Overwrite old OTP with new one + reset expiry
    redisTemplate.opsForValue()
            .set(key, newOtp, OTP_EXPIRY_MINUTES, TimeUnit.MINUTES);

    emailService.sendOtpEmail(email, newOtp);
}
}
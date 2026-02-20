package com.medicareplus.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicareplus.Security.JwtUtil;
import com.medicareplus.DTO.LoginRequest;
import com.medicareplus.DTO.LoginResponse;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;  
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    @Override
    @Transactional
    public User registerUser(User user) {
        validateNewUser(user);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User registerPatient(User user) {
        validateNewUser(user);
        user.setRole(UserRole.PATIENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
         user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User registerDoctor(User user) {
        validateNewUser(user);
        user.setRole(UserRole.DOCTOR);
        user.setStatus(UserStatus.PENDING_APPROVAL);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
         user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User registerAdmin(User user) {
        validateNewUser(user);
        user.setRole(UserRole.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    @Override
    public List<User> getActiveUsersByRole(UserRole role) {
        return userRepository.findActiveUsersByRole(role);
    }

    @Override
    public List<User> getPendingDoctors() {
        return userRepository.findPendingDoctors();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public User getUserByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found with phone: " + phone));
    }

    @Override
    @Transactional
    public User updateUser(Integer id, User userDetails) {
        User existingUser = getUserById(id);

        existingUser.setName(userDetails.getName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setPhone(userDetails.getPhone());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(userDetails.getPassword());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public User approveDoctor(Integer doctorId) {
        User doctor = getUserById(doctorId);

        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new RuntimeException("User is not a doctor");
        }

        doctor.setStatus(UserStatus.ACTIVE);
        doctor.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(doctor);
    }

    @Override
    @Transactional
    public User updateUserStatus(Integer id, UserStatus status) {
        User user = getUserById(id);
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllUsers() {
        userRepository.deleteAll();
    }

    @Override
    public long getCountByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    @Override
    public long getTotalUsers() {
        return userRepository.count();
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    private void validateNewUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered: " + user.getEmail());
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Phone number already registered: " + user.getPhone());
        }
    }


    @Override
public LoginResponse login(LoginRequest loginRequest) {
    User user = null;
    
    // Find user by email or phone
    if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
        user = userRepository.findByEmail(loginRequest.getEmail())
                .orElse(null);
    } else if (loginRequest.getPhone() != null && !loginRequest.getPhone().isEmpty()) {
        user = userRepository.findByPhone(loginRequest.getPhone())
                .orElse(null);
    } else {
        throw new RuntimeException("Email or Phone is required for login");
    }
    
    // Check if user exists
    if (user == null) {
        throw new RuntimeException("User not found with provided credentials");
    }
    
    // Check password using encoder
    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }
    
    // Check user status
    if (user.getStatus() == UserStatus.INACTIVE) {
        throw new RuntimeException("Your account is inactive. Please contact admin.");
    }
    
    if (user.getStatus() == UserStatus.SUSPENDED) {
        throw new RuntimeException("Your account has been suspended. Please contact admin.");
    }
    
    // Generate JWT token
    String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
    
    // Build response with token
    return LoginResponse.builder()
            .id(user.getId().longValue())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole())
            .status(user.getStatus())
            .token(token)
            .tokenType("Bearer")
            .expiresIn(jwtUtil.getExpirationTime())
            .loginTime(LocalDateTime.now())
            .message(user.getRole() == UserRole.DOCTOR && user.getStatus() == UserStatus.PENDING_APPROVAL
                    ? "Login successful. Your doctor account is pending admin approval."
                    : "Login successful")
            .build();
}
}

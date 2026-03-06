package com.medicareplus.Service;

import java.util.List;
import com.medicareplus.DTO.LoginRequest;
import com.medicareplus.DTO.LoginResponse;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;

public interface UserService {
    User registerUser(User user);
    User registerPatient(User user);
    User registerDoctor(User user);
    User registerAdmin(User user);

    // Login method
    LoginResponse login(LoginRequest loginRequest);

    List<User> getAllUsers();
    List<User> getUsersByRole(UserRole role);
    List<User> getActiveUsersByRole(UserRole role);
    List<User> getPendingDoctors();

    User getUserById(Integer id);
    User getUserByEmail(String email);
    User getUserByPhone(String phone);

    User updateUser(Integer id, User userDetails);
    User approveDoctor(Integer doctorId);
    User updateUserStatus(Integer id, UserStatus status);

    void deleteUser(Integer id);
    void deleteAllUsers();

    long getCountByRole(UserRole role);
    long getTotalUsers();

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    // Add this method for saving users directly
    User saveUser(User user);
}
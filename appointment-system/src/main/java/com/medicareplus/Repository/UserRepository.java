package com.medicareplus.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);

    long countByRole(UserRole role);

    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'ACTIVE'")
    List<User> findActiveUsersByRole(@Param("role") UserRole role);

    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.createdAt DESC")
    List<User> findRecentUsersByRole(@Param("role") UserRole role);

    @Query("SELECT u FROM User u WHERE u.role = 'DOCTOR' AND u.status = 'PENDING_APPROVAL'")
    List<User> findPendingDoctors();
}

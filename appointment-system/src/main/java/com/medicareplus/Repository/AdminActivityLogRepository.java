package com.medicareplus.Repository;

import com.medicareplus.Models.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findTop50ByOrderByCreatedAtDesc();
    List<AdminActivityLog> findTop10ByUnreadTrueOrderByCreatedAtDesc();
    long countByUnreadTrue();
}

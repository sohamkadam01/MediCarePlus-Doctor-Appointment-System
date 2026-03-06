package com.medicareplus.Service;

import com.medicareplus.Models.AdminActivityLog;
import com.medicareplus.Repository.AdminActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminActivityServiceImpl implements AdminActivityService {

    private final AdminActivityLogRepository adminActivityLogRepository;

    @Override
    @Transactional
    public void log(String activityType, String description, String actorRole, Integer actorId, String actorName, String targetType, Long targetId) {
        AdminActivityLog activity = AdminActivityLog.builder()
                .activityType(activityType)
                .description(description)
                .actorRole(actorRole)
                .actorId(actorId)
                .actorName(actorName)
                .targetType(targetType)
                .targetId(targetId)
                .unread(true)
                .createdAt(LocalDateTime.now())
                .build();
        adminActivityLogRepository.save(activity);
    }

    @Override
    public List<AdminActivityLog> getRecentActivities() {
        return adminActivityLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    @Override
    public List<AdminActivityLog> getUnreadNotifications() {
        return adminActivityLogRepository.findTop10ByUnreadTrueOrderByCreatedAtDesc();
    }

    @Override
    public long getUnreadCount() {
        return adminActivityLogRepository.countByUnreadTrue();
    }
}

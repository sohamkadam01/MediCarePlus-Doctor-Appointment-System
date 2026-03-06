package com.medicareplus.Service;

import com.medicareplus.Models.AdminActivityLog;
import java.util.List;

public interface AdminActivityService {
    void log(String activityType, String description, String actorRole, Integer actorId, String actorName, String targetType, Long targetId);
    List<AdminActivityLog> getRecentActivities();
    List<AdminActivityLog> getUnreadNotifications();
    long getUnreadCount();
}

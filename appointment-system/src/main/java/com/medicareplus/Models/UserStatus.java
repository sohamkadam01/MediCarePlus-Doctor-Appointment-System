package com.medicareplus.Models;

public enum UserStatus {
    ACTIVE,
    INACTIVE,
    PENDING_APPROVAL,  // For doctors waiting for admin approval
    SUSPENDED
}
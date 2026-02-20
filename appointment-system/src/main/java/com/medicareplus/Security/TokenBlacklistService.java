package com.medicareplus.Security;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {
    
    // Simple in-memory blacklist (use Redis in production)
    private final ConcurrentHashMap<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    
    // Blacklist a token
    public void blacklistToken(String token, long expirationTime) {
        blacklistedTokens.put(token, expirationTime);
    }
    
    // Check if token is blacklisted
    public boolean isTokenBlacklisted(String token) {
        removeExpiredTokens(); // Clean up expired tokens
        return blacklistedTokens.containsKey(token);
    }
    
    // Remove expired tokens from blacklist
    private void removeExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue() < now);
    }
    
    // Get blacklist size (for monitoring)
    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }
}
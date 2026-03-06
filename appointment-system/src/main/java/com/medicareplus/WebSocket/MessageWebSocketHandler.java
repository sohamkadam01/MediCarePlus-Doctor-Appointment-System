package com.medicareplus.WebSocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicareplus.DTO.MessageRealtimeEventDTO;
import com.medicareplus.Models.MessageThread;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Repository.MessageThreadRepository;
import com.medicareplus.Repository.UserRepository;
import com.medicareplus.Security.JwtUtil;
import com.medicareplus.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class MessageWebSocketHandler extends TextWebSocketHandler {

    private static final String USER_ID_ATTR = "wsUserId";

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserRepository userRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final ObjectMapper objectMapper;

    private final Map<Integer, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Integer userId = resolveUserId(session);
        if (userId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        session.getAttributes().put(USER_ID_ATTR, userId);
        Set<WebSocketSession> sessions = sessionsByUserId.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet());
        boolean wasOffline = sessions.isEmpty();
        sessions.add(session);
        if (wasOffline) {
            publishPresence(userId, true);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Integer removedUserId = removeSession(session);
        if (removedUserId != null && !isUserOnline(removedUserId)) {
            publishPresence(removedUserId, false);
        }
        super.afterConnectionClosed(session, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        Integer removedUserId = removeSession(session);
        if (removedUserId != null && !isUserOnline(removedUserId)) {
            publishPresence(removedUserId, false);
        }
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Integer actorUserId = getSessionUserId(session);
        if (actorUserId == null) {
            return;
        }

        Map<String, Object> payload;
        try {
            payload = objectMapper.readValue(message.getPayload(), Map.class);
        } catch (Exception e) {
            return;
        }

        String type = String.valueOf(payload.getOrDefault("type", "")).trim().toUpperCase();
        if (!"TYPING".equals(type)) {
            return;
        }

        Long threadId = toLong(payload.get("threadId"));
        if (threadId == null) {
            return;
        }

        MessageThread thread = messageThreadRepository.findById(threadId).orElse(null);
        if (thread == null) {
            return;
        }

        Integer doctorId = thread.getDoctor() != null ? thread.getDoctor().getId() : null;
        Integer patientId = thread.getPatient() != null ? thread.getPatient().getId() : null;
        if (doctorId == null || patientId == null) {
            return;
        }
        if (!actorUserId.equals(doctorId) && !actorUserId.equals(patientId)) {
            return;
        }

        Integer targetUserId = actorUserId.equals(doctorId) ? patientId : doctorId;
        boolean typing = Boolean.TRUE.equals(payload.get("typing"));

        MessageRealtimeEventDTO event = MessageRealtimeEventDTO.builder()
                .type("TYPING")
                .threadId(threadId)
                .doctorId(doctorId)
                .patientId(patientId)
                .actorUserId(actorUserId)
                .typing(typing)
                .build();

        sendToUser(targetUserId, event);
    }

    public void sendToUser(Integer userId, Object payload) {
        if (userId == null || payload == null) {
            return;
        }

        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        final String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            return;
        }

        for (WebSocketSession session : sessions) {
            if (session == null || !session.isOpen()) {
                continue;
            }
            try {
                session.sendMessage(new TextMessage(json));
            } catch (IOException ignored) {
                // Ignore single-session failures and continue fanout.
            }
        }
    }

    private Integer resolveUserId(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri == null || uri.getQuery() == null) {
                return null;
            }

            String token = extractQueryParam(uri.getQuery(), "token");
            if (token == null || token.isBlank()) {
                return null;
            }

            String normalized = token.startsWith("Bearer ") ? token.substring(7) : token;
            if (!jwtUtil.validateToken(normalized)) {
                return null;
            }

            String email = jwtUtil.extractUsername(normalized);
            if (email == null || email.isBlank()) {
                return null;
            }

            return userService.getUserByEmail(email).getId();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractQueryParam(String query, String key) {
        String prefix = key + "=";
        for (String pair : query.split("&")) {
            if (pair.startsWith(prefix)) {
                return URLDecoder.decode(pair.substring(prefix.length()), StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private Integer removeSession(WebSocketSession session) {
        Object attr = session.getAttributes().get(USER_ID_ATTR);
        if (!(attr instanceof Integer userId)) {
            return null;
        }

        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null) {
            return userId;
        }
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserId.remove(userId);
        }
        return userId;
    }

    private Integer getSessionUserId(WebSocketSession session) {
        Object attr = session.getAttributes().get(USER_ID_ATTR);
        if (attr instanceof Integer userId) {
            return userId;
        }
        return null;
    }

    private boolean isUserOnline(Integer userId) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    private void publishPresence(Integer actorUserId, boolean online) {
        User user = userRepository.findById(actorUserId).orElse(null);
        if (user == null) {
            return;
        }

        Set<Integer> targets = new HashSet<>();
        if (user.getRole() == UserRole.DOCTOR) {
            for (MessageThread thread : messageThreadRepository.findByDoctorIdOrderByUpdatedAtDesc(actorUserId)) {
                if (thread.getPatient() != null && thread.getPatient().getId() != null) {
                    targets.add(thread.getPatient().getId());
                }
            }
        } else if (user.getRole() == UserRole.PATIENT) {
            for (MessageThread thread : messageThreadRepository.findByPatientIdOrderByUpdatedAtDesc(actorUserId)) {
                if (thread.getDoctor() != null && thread.getDoctor().getId() != null) {
                    targets.add(thread.getDoctor().getId());
                }
            }
        } else {
            return;
        }

        MessageRealtimeEventDTO event = MessageRealtimeEventDTO.builder()
                .type("PRESENCE")
                .actorUserId(actorUserId)
                .online(online)
                .build();

        for (Integer targetId : targets) {
            sendToUser(targetId, event);
        }
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
    }
}

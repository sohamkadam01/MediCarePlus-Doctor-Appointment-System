package com.medicareplus.Controller;

import com.medicareplus.DTO.DoctorMessageThreadDTO;
import com.medicareplus.DTO.MessageItemDTO;
import com.medicareplus.DTO.SendMessageRequestDTO;
import com.medicareplus.Service.DoctorMessageService;
import com.medicareplus.Service.MessageRealtimeNotifier;
import com.medicareplus.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages/doctor")
@CrossOrigin("*")

@RequiredArgsConstructor
public class DoctorMessageController {

    private final DoctorMessageService doctorMessageService;
    private final UserService userService;
    private final MessageRealtimeNotifier messageRealtimeNotifier;

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByEmail(username).getId();
    }

    @GetMapping("/threads")
    public ResponseEntity<?> getThreads() {
        try {
            Integer doctorId = getCurrentUserId();
            List<DoctorMessageThreadDTO> threads = doctorMessageService.getDoctorThreads(doctorId);
            return ResponseEntity.ok(threads);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<?> getThreadMessages(@PathVariable Long threadId) {
        try {
            Integer doctorId = getCurrentUserId();
            List<MessageItemDTO> messages = doctorMessageService.getThreadMessages(doctorId, threadId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long threadId, @RequestBody SendMessageRequestDTO request) {
        try {
            Integer doctorId = getCurrentUserId();
            MessageItemDTO sent = doctorMessageService.sendDoctorMessage(doctorId, threadId, request.getText());
            messageRealtimeNotifier.publishNewMessage(threadId, sent);
            return ResponseEntity.ok(sent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PatchMapping("/threads/{threadId}/read")
    public ResponseEntity<?> markThreadRead(@PathVariable Long threadId) {
        try {
            Integer doctorId = getCurrentUserId();
            doctorMessageService.markThreadAsRead(doctorId, threadId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    static class ErrorResponse {
        private String error;
        private long timestamp;
        public ErrorResponse(String message) {
            this.error = message;
            this.timestamp = System.currentTimeMillis();
        }
        public String getError() { return error; }
        public long getTimestamp() { return timestamp; }
    }
}

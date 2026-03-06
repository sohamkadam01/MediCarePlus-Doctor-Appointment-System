package com.medicareplus.Controller;

import com.medicareplus.DTO.ChatRequestDTO;
import com.medicareplus.DTO.ChatResponseDTO;
import com.medicareplus.Service.DoctorChatService;
import com.medicareplus.Service.PatientChatService;
import com.medicareplus.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin("*")
@RequiredArgsConstructor
public class PatientChatController {

    private final PatientChatService patientChatService;
    private final DoctorChatService doctorChatService;
    private final UserService userService;

    @PostMapping("/patient/assistant")
    public ResponseEntity<ChatResponseDTO> patientAssistant(@Valid @RequestBody ChatRequestDTO request) {
        Integer patientId = getCurrentUserId();
        ChatResponseDTO response = patientChatService.generateReply(patientId, request.getMessage());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/doctor/assistant")
    public ResponseEntity<ChatResponseDTO> doctorAssistant(@Valid @RequestBody ChatRequestDTO request) {
        Integer doctorId = getCurrentUserId();
        ChatResponseDTO response = doctorChatService.generateReply(doctorId, request.getMessage());
        return ResponseEntity.ok(response);
    }

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.getUserByEmail(authentication.getName()).getId();
    }
}

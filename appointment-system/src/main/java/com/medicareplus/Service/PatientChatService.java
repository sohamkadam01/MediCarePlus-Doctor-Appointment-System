package com.medicareplus.Service;

import com.medicareplus.DTO.ChatResponseDTO;

public interface PatientChatService {
    ChatResponseDTO generateReply(Integer patientId, String message);
}


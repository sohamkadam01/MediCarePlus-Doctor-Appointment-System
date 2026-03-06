package com.medicareplus.Service;

import com.medicareplus.DTO.ChatResponseDTO;

public interface DoctorChatService {
    ChatResponseDTO generateReply(Integer doctorId, String message);
}


package com.medicareplus.Service;

import com.medicareplus.DTO.DoctorMessageThreadDTO;
import com.medicareplus.DTO.MessageItemDTO;

import java.util.List;

public interface DoctorMessageService {
    List<DoctorMessageThreadDTO> getDoctorThreads(Integer doctorId);
    List<MessageItemDTO> getThreadMessages(Integer doctorId, Long threadId);
    MessageItemDTO sendDoctorMessage(Integer doctorId, Long threadId, String text);
    void markThreadAsRead(Integer doctorId, Long threadId);
}


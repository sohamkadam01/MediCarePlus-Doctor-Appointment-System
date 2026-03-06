package com.medicareplus.Service;

import com.medicareplus.DTO.MessageItemDTO;
import com.medicareplus.DTO.PatientMessageThreadDTO;

import java.util.List;

public interface PatientMessageService {
    List<PatientMessageThreadDTO> getPatientThreads(Integer patientId);
    List<MessageItemDTO> getThreadMessages(Integer patientId, Long threadId);
    MessageItemDTO sendPatientMessage(Integer patientId, Long threadId, String text);
    void markThreadAsRead(Integer patientId, Long threadId);
}


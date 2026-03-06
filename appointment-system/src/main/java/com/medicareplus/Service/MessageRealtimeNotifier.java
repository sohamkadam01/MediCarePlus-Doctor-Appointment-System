package com.medicareplus.Service;

import com.medicareplus.DTO.MessageItemDTO;
import com.medicareplus.DTO.MessageRealtimeEventDTO;
import com.medicareplus.Models.MessageThread;
import com.medicareplus.Repository.MessageThreadRepository;
import com.medicareplus.WebSocket.MessageWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageRealtimeNotifier {

    private final MessageThreadRepository messageThreadRepository;
    private final MessageWebSocketHandler messageWebSocketHandler;

    public void publishNewMessage(Long threadId, MessageItemDTO message) {
        if (threadId == null || message == null) {
            return;
        }

        MessageThread thread = messageThreadRepository.findById(threadId).orElse(null);
        if (thread == null) {
            return;
        }

        Integer doctorId = thread.getDoctor() != null ? thread.getDoctor().getId() : null;
        Integer patientId = thread.getPatient() != null ? thread.getPatient().getId() : null;

        MessageRealtimeEventDTO event = MessageRealtimeEventDTO.builder()
                .type("MESSAGE_CREATED")
                .threadId(threadId)
                .doctorId(doctorId)
                .patientId(patientId)
                .message(message)
                .build();

        messageWebSocketHandler.sendToUser(doctorId, event);
        if (patientId != null && !patientId.equals(doctorId)) {
            messageWebSocketHandler.sendToUser(patientId, event);
        }
    }
}

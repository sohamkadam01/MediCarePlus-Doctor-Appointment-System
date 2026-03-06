package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRealtimeEventDTO {
    private String type;
    private Long threadId;
    private Integer doctorId;
    private Integer patientId;
    private Integer actorUserId;
    private Boolean typing;
    private Boolean online;
    private MessageItemDTO message;
}

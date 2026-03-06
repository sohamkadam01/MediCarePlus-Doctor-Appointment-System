package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageItemDTO {
    private Long id;
    private String sender;
    private String text;
    private String time;
    private boolean unread;
    private String createdAt;
}


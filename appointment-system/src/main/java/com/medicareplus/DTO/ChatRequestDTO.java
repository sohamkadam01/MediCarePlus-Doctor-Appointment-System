package com.medicareplus.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequestDTO {
    @NotBlank(message = "Message is required")
    private String message;
}


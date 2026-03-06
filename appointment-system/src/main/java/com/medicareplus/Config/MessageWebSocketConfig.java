package com.medicareplus.Config;

import com.medicareplus.WebSocket.MessageWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor

public class MessageWebSocketConfig implements WebSocketConfigurer {

    private final MessageWebSocketHandler messageWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(messageWebSocketHandler, "/ws/messages")
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*");
    }
}

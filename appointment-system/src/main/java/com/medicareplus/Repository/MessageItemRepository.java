package com.medicareplus.Repository;

import com.medicareplus.Models.MessageItem;
import com.medicareplus.Models.MessageSenderRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageItemRepository extends JpaRepository<MessageItem, Long> {

    List<MessageItem> findByThreadIdOrderByCreatedAtAsc(Long threadId);

    Optional<MessageItem> findTopByThreadIdOrderByCreatedAtDesc(Long threadId);

    long countByThreadIdAndSenderRoleAndReadFalse(Long threadId, MessageSenderRole senderRole);

    List<MessageItem> findByThreadIdAndSenderRoleAndReadFalse(Long threadId, MessageSenderRole senderRole);
}


package com.medicareplus.Service;

import com.medicareplus.DTO.MessageItemDTO;
import com.medicareplus.DTO.PatientMessageThreadDTO;
import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.MessageItem;
import com.medicareplus.Models.MessageSenderRole;
import com.medicareplus.Models.MessageThread;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Repository.AppointmentRepository;
import com.medicareplus.Repository.MessageItemRepository;
import com.medicareplus.Repository.MessageThreadRepository;
import com.medicareplus.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientMessageServiceImpl implements PatientMessageService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final MessageItemRepository messageItemRepository;

    @Override
    public List<PatientMessageThreadDTO> getPatientThreads(Integer patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        if (patient.getRole() != UserRole.PATIENT) {
            throw new IllegalArgumentException("User is not a patient");
        }

        syncThreadsFromAppointments(patient);

        List<MessageThread> allThreads = messageThreadRepository.findAll()
                .stream()
                .filter(t -> t.getPatient() != null && patientId.equals(t.getPatient().getId()))
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());

        return allThreads.stream()
                .map(this::toThreadDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageItemDTO> getThreadMessages(Integer patientId, Long threadId) {
        MessageThread thread = messageThreadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Message thread not found"));
        if (thread.getPatient() == null || !patientId.equals(thread.getPatient().getId())) {
            throw new IllegalArgumentException("Not authorized to view this message thread");
        }
        return messageItemRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId())
                .stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageItemDTO sendPatientMessage(Integer patientId, Long threadId, String text) {
        String messageText = String.valueOf(text == null ? "" : text).trim();
        if (messageText.isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        MessageThread thread = messageThreadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Message thread not found"));
        if (thread.getPatient() == null || !patientId.equals(thread.getPatient().getId())) {
            throw new IllegalArgumentException("Not authorized to send in this message thread");
        }

        MessageItem item = MessageItem.builder()
                .thread(thread)
                .senderUser(patient)
                .senderRole(MessageSenderRole.PATIENT)
                .messageText(messageText)
                .read(true)
                .build();

        MessageItem saved = messageItemRepository.save(item);
        thread.setUpdatedAt(LocalDateTime.now());
        messageThreadRepository.save(thread);
        return toMessageDTO(saved);
    }

    @Override
    public void markThreadAsRead(Integer patientId, Long threadId) {
        MessageThread thread = messageThreadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Message thread not found"));
        if (thread.getPatient() == null || !patientId.equals(thread.getPatient().getId())) {
            throw new IllegalArgumentException("Not authorized to update this message thread");
        }

        List<MessageItem> unreadDoctorMessages = messageItemRepository
                .findByThreadIdAndSenderRoleAndReadFalse(thread.getId(), MessageSenderRole.DOCTOR);
        unreadDoctorMessages.forEach(item -> item.setRead(true));
        if (!unreadDoctorMessages.isEmpty()) {
            messageItemRepository.saveAll(unreadDoctorMessages);
        }
    }

    private void syncThreadsFromAppointments(User patient) {
        List<Appointment> patientAppointments = appointmentRepository
                .findByPatientOrderByAppointmentDateDescAppointmentTimeDesc(patient);

        Map<Integer, MessageThread> byDoctorId = new HashMap<>();
        for (MessageThread thread : messageThreadRepository.findAll()) {
            if (thread.getPatient() != null
                    && patient.getId().equals(thread.getPatient().getId())
                    && thread.getDoctor() != null) {
                byDoctorId.put(thread.getDoctor().getId(), thread);
            }
        }

        List<MessageThread> updates = new ArrayList<>();
        for (Appointment appointment : patientAppointments) {
            if (appointment.getDoctor() == null) continue;
            Integer doctorId = appointment.getDoctor().getId();
            MessageThread existing = byDoctorId.get(doctorId);

            if (existing == null) {
                MessageThread created = MessageThread.builder()
                        .doctor(appointment.getDoctor())
                        .patient(patient)
                        .lastAppointment(appointment)
                        .build();
                created = messageThreadRepository.save(created);
                byDoctorId.put(doctorId, created);
                continue;
            }

            Appointment last = existing.getLastAppointment();
            if (isAfter(appointment, last)) {
                existing.setLastAppointment(appointment);
                existing.setUpdatedAt(LocalDateTime.now());
                updates.add(existing);
            }
        }

        if (!updates.isEmpty()) {
            messageThreadRepository.saveAll(updates);
        }
    }

    private boolean isAfter(Appointment current, Appointment previous) {
        if (current == null) return false;
        if (previous == null) return true;
        LocalDateTime c = LocalDateTime.of(
                current.getAppointmentDate(),
                current.getAppointmentTime() != null ? current.getAppointmentTime() : LocalTime.MIDNIGHT
        );
        LocalDateTime p = LocalDateTime.of(
                previous.getAppointmentDate(),
                previous.getAppointmentTime() != null ? previous.getAppointmentTime() : LocalTime.MIDNIGHT
        );
        return c.isAfter(p);
    }

    private PatientMessageThreadDTO toThreadDTO(MessageThread thread) {
        Appointment a = thread.getLastAppointment();
        MessageItem lastMessage = messageItemRepository.findTopByThreadIdOrderByCreatedAtDesc(thread.getId()).orElse(null);
        long unread = messageItemRepository.countByThreadIdAndSenderRoleAndReadFalse(thread.getId(), MessageSenderRole.DOCTOR);

        return PatientMessageThreadDTO.builder()
                .id(thread.getId())
                .doctorId(thread.getDoctor() != null ? thread.getDoctor().getId() : null)
                .doctorName(thread.getDoctor() != null ? thread.getDoctor().getName() : "Doctor")
                .appointmentId(a != null ? a.getId() : null)
                .appointmentDate(a != null && a.getAppointmentDate() != null ? a.getAppointmentDate().toString() : "-")
                .appointmentTime(a != null && a.getAppointmentTime() != null ? a.getAppointmentTime().toString() : "-")
                .appointmentStatus(a != null && a.getStatus() != null ? a.getStatus().name() : "PENDING")
                .lastMessageAt(lastMessage != null && lastMessage.getCreatedAt() != null
                        ? lastMessage.getCreatedAt().toString()
                        : thread.getUpdatedAt().toString())
                .lastMessageText(lastMessage != null ? lastMessage.getMessageText() : "No messages yet.")
                .unreadCount(unread)
                .build();
    }

    private MessageItemDTO toMessageDTO(MessageItem item) {
        String sender = "system";
        if (item.getSenderRole() == MessageSenderRole.DOCTOR) sender = "doctor";
        if (item.getSenderRole() == MessageSenderRole.PATIENT) sender = "patient";

        String time = item.getCreatedAt() != null ? item.getCreatedAt().toLocalTime().toString() : "--:--";
        if (time.length() >= 5) time = time.substring(0, 5);


        return MessageItemDTO.builder()
                .id(item.getId())
                .sender(sender)
                .text(item.getMessageText())
                .time(time)
                .unread(item.getSenderRole() == MessageSenderRole.DOCTOR && !item.isRead())
                .createdAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "")
                .build();
    }
}


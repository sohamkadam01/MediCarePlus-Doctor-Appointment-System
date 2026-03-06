package com.medicareplus.Service;

import com.medicareplus.DTO.DoctorMessageThreadDTO;
import com.medicareplus.DTO.MessageItemDTO;
import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorMessageServiceImpl implements DoctorMessageService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final MessageItemRepository messageItemRepository;

    @Override
    public List<DoctorMessageThreadDTO> getDoctorThreads(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("User is not a doctor");
        }

        syncThreadsFromAppointments(doctor);

        List<MessageThread> threads = messageThreadRepository.findByDoctorIdOrderByUpdatedAtDesc(doctorId);
        return threads.stream()
                .map(this::toThreadDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageItemDTO> getThreadMessages(Integer doctorId, Long threadId) {
        MessageThread thread = messageThreadRepository.findByIdAndDoctorId(threadId, doctorId)
                .orElseThrow(() -> new RuntimeException("Message thread not found"));
        return messageItemRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId())
                .stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageItemDTO sendDoctorMessage(Integer doctorId, Long threadId, String text) {
        String messageText = String.valueOf(text == null ? "" : text).trim();
        if (messageText.isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        MessageThread thread = messageThreadRepository.findByIdAndDoctorId(threadId, doctorId)
                .orElseThrow(() -> new RuntimeException("Message thread not found"));

        MessageItem item = MessageItem.builder()
                .thread(thread)
                .senderUser(doctor)
                .senderRole(MessageSenderRole.DOCTOR)
                .messageText(messageText)
                .read(true)
                .build();

        MessageItem saved = messageItemRepository.save(item);
        thread.setUpdatedAt(LocalDateTime.now());
        messageThreadRepository.save(thread);
        return toMessageDTO(saved);
    }

    @Override
    public void markThreadAsRead(Integer doctorId, Long threadId) {
        MessageThread thread = messageThreadRepository.findByIdAndDoctorId(threadId, doctorId)
                .orElseThrow(() -> new RuntimeException("Message thread not found"));

        List<MessageItem> unreadPatientMessages = messageItemRepository
                .findByThreadIdAndSenderRoleAndReadFalse(thread.getId(), MessageSenderRole.PATIENT);
        unreadPatientMessages.forEach(item -> item.setRead(true));
        if (!unreadPatientMessages.isEmpty()) {
            messageItemRepository.saveAll(unreadPatientMessages);
        }
    }

    private void syncThreadsFromAppointments(User doctor) {
        List<Appointment> doctorAppointments = appointmentRepository
                .findByDoctorOrderByAppointmentDateDescAppointmentTimeDesc(doctor);

        Map<Integer, MessageThread> byPatientId = new HashMap<>();
        for (MessageThread t : messageThreadRepository.findByDoctorIdOrderByUpdatedAtDesc(doctor.getId())) {
            if (t.getPatient() != null) {
                byPatientId.put(t.getPatient().getId(), t);
            }
        }

        List<MessageThread> toSave = new ArrayList<>();
        for (Appointment appointment : doctorAppointments) {
            if (appointment.getPatient() == null) continue;
            Integer patientId = appointment.getPatient().getId();
            MessageThread existing = byPatientId.get(patientId);

            if (existing == null) {
                MessageThread created = MessageThread.builder()
                        .doctor(doctor)
                        .patient(appointment.getPatient())
                        .lastAppointment(appointment)
                        .build();
                created = messageThreadRepository.save(created);
                byPatientId.put(patientId, created);

                // Seed first patient message from appointment context.
                String reason = appointment.getReason() != null ? appointment.getReason() : "consultation";
                boolean unread = appointment.getStatus() == AppointmentStatus.PENDING
                        || appointment.getStatus() == AppointmentStatus.CONFIRMED;
                MessageItem seed = MessageItem.builder()
                        .thread(created)
                        .senderUser(appointment.getPatient())
                        .senderRole(MessageSenderRole.PATIENT)
                        .messageText("Hi doctor, I have a " + reason.toLowerCase() + " request.")
                        .read(!unread)
                        .build();
                messageItemRepository.save(seed);
                continue;
            }

            Appointment last = existing.getLastAppointment();
            if (isAfter(appointment, last)) {
                existing.setLastAppointment(appointment);
                existing.setUpdatedAt(LocalDateTime.now());
                toSave.add(existing);
            }
        }
        if (!toSave.isEmpty()) {
            messageThreadRepository.saveAll(toSave);
        }
    }

    private boolean isAfter(Appointment current, Appointment previous) {
        if (current == null) return false;
        if (previous == null) return true;
        LocalDateTime c = LocalDateTime.of(
                current.getAppointmentDate(),
                current.getAppointmentTime() != null ? current.getAppointmentTime() : java.time.LocalTime.MIDNIGHT
        );
        LocalDateTime p = LocalDateTime.of(
                previous.getAppointmentDate(),
                previous.getAppointmentTime() != null ? previous.getAppointmentTime() : java.time.LocalTime.MIDNIGHT
        );
        return c.isAfter(p);
    }

    private DoctorMessageThreadDTO toThreadDTO(MessageThread thread) {
        Appointment a = thread.getLastAppointment();
        MessageItem lastMessage = messageItemRepository.findTopByThreadIdOrderByCreatedAtDesc(thread.getId()).orElse(null);
        long unread = messageItemRepository.countByThreadIdAndSenderRoleAndReadFalse(thread.getId(), MessageSenderRole.PATIENT);

        return DoctorMessageThreadDTO.builder()
                .id(thread.getId())
                .patientId(thread.getPatient() != null ? thread.getPatient().getId() : null)
                .patientName(thread.getPatient() != null ? thread.getPatient().getName() : "Patient")
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

        String time = item.getCreatedAt() != null
                ? item.getCreatedAt().toLocalTime().toString()
                : "--:--";
        if (time.length() >= 5) {
            time = time.substring(0, 5);
        }

        return MessageItemDTO.builder()
                .id(item.getId())
                .sender(sender)
                .text(item.getMessageText())
                .time(time)
                .unread(item.getSenderRole() == MessageSenderRole.PATIENT && !item.isRead())
                .createdAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "")
                .build();
    }
}


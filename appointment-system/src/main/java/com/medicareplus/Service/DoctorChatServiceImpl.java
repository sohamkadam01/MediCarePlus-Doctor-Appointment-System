package com.medicareplus.Service;

import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.ChatResponseDTO;
import com.medicareplus.DTO.DoctorAppointmentStats;
import com.medicareplus.Models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorChatServiceImpl implements DoctorChatService {

    private final AppointmentService appointmentService;
    private final UserService userService;

    @Transactional(readOnly = true)
    @Override
    public ChatResponseDTO generateReply(Integer doctorId, String message) {
        String prompt = message == null ? "" : message.trim();
        String normalized = prompt.toLowerCase(Locale.ROOT);

        User doctor = userService.getUserById(doctorId);
        String firstName = doctor != null && doctor.getName() != null && !doctor.getName().isBlank()
                ? doctor.getName().split(" ")[0]
                : "Doctor";

        if (normalized.isBlank()) {
            return helpResponse("Please ask a question about your schedule, patients, or appointments.");
        }

        if (containsAny(normalized, "hello", "hi", "hey", "good morning", "good evening")) {
            return ChatResponseDTO.builder()
                    .intent("GREETING")
                    .reply("Hi Dr. " + firstName + ". I can help with today's schedule, pending requests, and performance summary.")
                    .suggestions(List.of(
                            "Show today's appointments",
                            "How many pending requests?",
                            "Show my revenue summary"
                    ))
                    .build();
        }

        if (containsAny(normalized, "today", "today appointment", "today schedule", "timeline")) {
            List<AppointmentResponseDTO> todayAppointments = appointmentService.getDoctorTodayAppointments(doctorId);
            if (todayAppointments.isEmpty()) {
                return ChatResponseDTO.builder()
                        .intent("TODAY_SCHEDULE")
                        .reply("You have no appointments scheduled for " + LocalDate.now() + ".")
                        .suggestions(List.of("Show pending requests", "Open availability settings"))
                        .build();
            }

            String lines = todayAppointments.stream()
                    .sorted((a, b) -> String.valueOf(a.getAppointmentTime()).compareTo(String.valueOf(b.getAppointmentTime())))
                    .limit(5)
                    .map(this::formatDoctorAppointmentLine)
                    .collect(Collectors.joining("\n"));

            return ChatResponseDTO.builder()
                    .intent("TODAY_SCHEDULE")
                    .reply("Today's schedule:\n" + lines)
                    .suggestions(List.of("Show pending requests", "Show confirmed appointments"))
                    .build();
        }

        if (containsAny(normalized, "pending", "request", "approval", "approve")) {
            List<AppointmentResponseDTO> allAppointments = appointmentService.getDoctorAppointments(doctorId);
            List<AppointmentResponseDTO> pending = allAppointments.stream()
                    .filter(a -> a.getStatus() != null && "PENDING".equalsIgnoreCase(a.getStatus().name()))
                    .limit(5)
                    .toList();

            if (pending.isEmpty()) {
                return ChatResponseDTO.builder()
                        .intent("PENDING_REQUESTS")
                        .reply("No pending appointment requests right now.")
                        .suggestions(List.of("Show today's appointments", "Open appointments section"))
                        .build();
            }

            String lines = pending.stream().map(this::formatDoctorAppointmentLine).collect(Collectors.joining("\n"));
            return ChatResponseDTO.builder()
                    .intent("PENDING_REQUESTS")
                    .reply("Pending requests:\n" + lines + "\n\nYou can accept or reject these from the Appointment Request panel.")
                    .suggestions(List.of("Open appointments section", "Show today's appointments"))
                    .build();
        }

        if (containsAny(normalized, "upcoming", "next", "future")) {
            List<AppointmentResponseDTO> upcoming = appointmentService.getDoctorUpcomingAppointments(doctorId);
            if (upcoming.isEmpty()) {
                return ChatResponseDTO.builder()
                        .intent("UPCOMING_APPOINTMENTS")
                        .reply("No upcoming appointments found.")
                        .suggestions(List.of("Open availability settings", "Show pending requests"))
                        .build();
            }

            String lines = upcoming.stream()
                    .limit(5)
                    .map(this::formatDoctorAppointmentLine)
                    .collect(Collectors.joining("\n"));

            return ChatResponseDTO.builder()
                    .intent("UPCOMING_APPOINTMENTS")
                    .reply("Upcoming appointments:\n" + lines)
                    .suggestions(List.of("Show today's appointments", "Show revenue summary"))
                    .build();
        }

        if (containsAny(normalized, "earn", "revenue", "income", "payment", "summary", "stats")) {
            DoctorAppointmentStats stats = appointmentService.getDoctorStats(doctorId);
            String reply = String.format(
                    "Performance summary: total %d appointments, today %d, upcoming %d, completed %d, total revenue ₹%.2f.",
                    stats.getTotalAppointments(),
                    stats.getTodayAppointments(),
                    stats.getUpcomingAppointments(),
                    stats.getCompletedAppointments(),
                    stats.getTotalRevenue()
            );
            return ChatResponseDTO.builder()
                    .intent("PERFORMANCE_SUMMARY")
                    .reply(reply)
                    .suggestions(List.of("Show pending requests", "Show today's appointments"))
                    .build();
        }

        if (containsAny(normalized, "complete", "mark complete", "finish")) {
            return ChatResponseDTO.builder()
                    .intent("COMPLETE_APPOINTMENT_HELP")
                    .reply("You can mark an appointment completed from the Today Appointment list when its status is CONFIRMED.")
                    .suggestions(List.of("Show today's appointments", "Show confirmed appointments"))
                    .build();
        }

        return helpResponse("I can help with today's schedule, pending requests, upcoming visits, and performance stats.");
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String formatDoctorAppointmentLine(AppointmentResponseDTO appointment) {
        String patient = appointment.getPatientName() == null ? "Patient" : appointment.getPatientName();
        String date = appointment.getAppointmentDate() == null ? "date TBD" : appointment.getAppointmentDate().toString();
        String time = appointment.getAppointmentTime() == null ? "time TBD" : appointment.getAppointmentTime().toString();
        String status = appointment.getStatus() == null ? "PENDING" : appointment.getStatus().name();
        return "- " + patient + " on " + date + " at " + time + " (" + status + ")";
    }

    private ChatResponseDTO helpResponse(String intro) {
        List<String> suggestions = new ArrayList<>();
        suggestions.add("Show today's appointments");
        suggestions.add("How many pending requests?");
        suggestions.add("Show my revenue summary");
        suggestions.add("Show upcoming appointments");

        return ChatResponseDTO.builder()
                .intent("HELP")
                .reply(intro)
                .suggestions(suggestions)
                .build();
    }
}


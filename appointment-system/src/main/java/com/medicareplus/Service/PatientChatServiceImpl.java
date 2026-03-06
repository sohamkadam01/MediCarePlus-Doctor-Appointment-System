package com.medicareplus.Service;

import com.medicareplus.DTO.AppointmentResponseDTO;
import com.medicareplus.DTO.ChatResponseDTO;
import com.medicareplus.DTO.PatientAppointmentStats;
import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PatientChatServiceImpl implements PatientChatService {
    private final AppointmentService appointmentService;
    private final UserService userService;
    private final DoctorDetailsService doctorDetailsService;
    @Transactional(readOnly = true)
    @Override


    public ChatResponseDTO generateReply(Integer patientId, String message) {
        String prompt = message == null ? "" : message.trim();
        String normalized = prompt.toLowerCase(Locale.ROOT);

        User user = userService.getUserById(patientId);
        String firstName = user != null && user.getName() != null && !user.getName().isBlank()
                ? user.getName().split(" ")[0]
                : "there";

        if (normalized.isBlank()) {
            return helpResponse("Please type a question so I can help.");
        }

        if (containsAny(normalized, "hello", "hi", "hey", "good morning", "good evening")) {
            return ChatResponseDTO.builder()
                    .intent("GREETING")
                    .reply("Hi " + firstName + ". I can help with upcoming appointments, records, doctors, rebooking, and payments.")
                    .suggestions(List.of(
                            "Show my upcoming appointments",
                            "Summarize my medical records",
                            "How many appointments do I have?"
                    ))
                    .build();
        }

        if (containsAny(normalized, "upcoming", "next appointment", "next visit", "today appointment")) {
            List<AppointmentResponseDTO> upcoming = appointmentService.getPatientUpcomingAppointments(patientId);
            if (upcoming.isEmpty()) {
                return ChatResponseDTO.builder()
                        .intent("UPCOMING_APPOINTMENTS")
                        .reply("You have no upcoming appointments. You can book a new visit from the dashboard.")
                        .suggestions(List.of("Book new appointment", "Find doctors"))
                        .build();
            }

            String lines = upcoming.stream()
                    .limit(3)
                    .map(this::formatAppointmentLine)
                    .collect(Collectors.joining("\n"));

            return ChatResponseDTO.builder()
                    .intent("UPCOMING_APPOINTMENTS")
                    .reply("Here are your next appointments:\n" + lines)
                    .suggestions(List.of("Open appointments tab", "Show my past appointments"))
                    .build();
        }

        
        if (containsAny(normalized, "past", "history", "last appointment", "completed")) {
            List<AppointmentResponseDTO> past = appointmentService.getPatientPastAppointments(patientId);
            if (past.isEmpty()) {
                return ChatResponseDTO.builder()
                        .intent("PAST_APPOINTMENTS")
                        .reply("You don't have past appointments yet.")
                        .suggestions(List.of("Book new appointment", "Find doctors"))
                        .build();
            }

            String lines = past.stream()
                    .limit(3)
                    .map(this::formatAppointmentLine)
                    .collect(Collectors.joining("\n"));

            return ChatResponseDTO.builder()
                    .intent("PAST_APPOINTMENTS")
                    .reply("Your recent visit history:\n" + lines)
                    .suggestions(List.of("Book again from last visit", "Show my records"))
                    .build();
        }

        if (containsAny(normalized, "record", "diagnosis", "prescription", "report")) {
            List<AppointmentResponseDTO> past = appointmentService.getPatientPastAppointments(patientId);

            long diagnosisCount = past.stream().filter(a -> a.getDiagnosis() != null && !a.getDiagnosis().isBlank()).count();
            long prescriptionCount = past.stream().filter(a -> a.getPrescription() != null && !a.getPrescription().isBlank()).count();

            String reply = "Records summary: " + diagnosisCount + " diagnosis entries and " + prescriptionCount
                    + " prescription entries are available.";
            return ChatResponseDTO.builder()
                    .intent("MEDICAL_RECORDS")
                    .reply(reply)
                    .suggestions(List.of("Open medical records tab", "Show follow-up details"))
                    .build();
        }

        if (containsAny(normalized, "cancel", "reschedule", "change time", "change date")) {
            return ChatResponseDTO.builder()
                    .intent("APPOINTMENT_ACTION")
                    .reply("To cancel or reschedule, open Appointments, pick the booking, then use Cancel or Reschedule actions.")
                    .suggestions(List.of("Open appointments tab", "Show upcoming appointments"))
                    .build();
        }

        if (containsAny(normalized, "payment", "bill", "invoice", "fee")) {
            List<AppointmentResponseDTO> past = appointmentService.getPatientPastAppointments(patientId);
            double totalSpent = past.stream()
                    .map(AppointmentResponseDTO::getConsultationFee)
                    .filter(fee -> fee != null && fee > 0)
                    .mapToDouble(Double::doubleValue)
                    .sum();

            return ChatResponseDTO.builder()
                    .intent("PAYMENT")
                    .reply(String.format("Your tracked consultation spend is ₹%.2f. Open Payments tab for billing details.", totalSpent))
                    .suggestions(List.of("Open payments tab", "Show completed appointments"))
                    .build();
        }

        if (containsAny(normalized, "stats", "summary", "overview", "count")) {
            PatientAppointmentStats stats = appointmentService.getPatientStats(patientId);
            String reply = "Appointment summary: total " + stats.getTotalAppointments()
                    + ", upcoming " + stats.getUpcomingAppointments()
                    + ", completed " + stats.getCompletedAppointments()
                    + ", cancelled " + stats.getCancelledAppointments() + ".";
            return ChatResponseDTO.builder()
                    .intent("APPOINTMENT_STATS")
                    .reply(reply)
                    .suggestions(List.of("Show my upcoming appointments", "Show my visit history"))
                    .build();
        }

        DoctorRecommendationIntent doctorIntent = detectDoctorIntent(normalized);
        if (doctorIntent != null) {
            return recommendDoctors(doctorIntent);
        }

        return helpResponse("I can help with appointments, records, payments, and dashboard navigation.");
    }

    private String formatAppointmentLine(AppointmentResponseDTO appointment) {
        String doctor = appointment.getDoctorName() == null ? "Doctor" : appointment.getDoctorName();
        String date = appointment.getAppointmentDate() == null ? "date TBD" : appointment.getAppointmentDate().toString();
        String time = appointment.getAppointmentTime() == null ? "time TBD" : appointment.getAppointmentTime().toString();
        String status = appointment.getStatus() == null ? "PENDING" : appointment.getStatus().name();
        return "- Dr. " + doctor + " on " + date + " at " + time + " (" + status + ")";
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private ChatResponseDTO helpResponse(String intro) {
        List<String> suggestions = new ArrayList<>();
        suggestions.add("Show my upcoming appointments");
        suggestions.add("Summarize my records");
        suggestions.add("Open payments info");
        suggestions.add("How do I rebook?");
        suggestions.add("Best doctor for diabetes");

        return ChatResponseDTO.builder()
                .intent("HELP")
                .reply(intro)
                .suggestions(suggestions)
                .build();
    }

    private ChatResponseDTO recommendDoctors(DoctorRecommendationIntent intent) {
        List<User> doctors = userService.getActiveUsersByRole(UserRole.DOCTOR);
        List<DoctorCandidate> candidates = doctors.stream()
                .map(user -> {
                    DoctorDetails details = doctorDetailsService.findByUserIdOrNull(user.getId());
                    if (details == null || !details.isApproved()) return null;
                    String specialization = details.getSpecializationName();
                    if (specialization == null || specialization.isBlank()) return null;
                    return new DoctorCandidate(user, details, specialization);
                })
                .filter(candidate -> candidate != null)
                .filter(candidate -> candidate.specialization.toLowerCase(Locale.ROOT)
                        .contains(intent.specialization.toLowerCase(Locale.ROOT)))
                .sorted(Comparator
                        .comparingInt((DoctorCandidate c) -> c.details.getExperienceYear() == null ? 0 : c.details.getExperienceYear())
                        .reversed()
                        .thenComparing(c -> c.details.getConsultationFee() == null ? Double.MAX_VALUE : c.details.getConsultationFee().doubleValue()))
                .limit(3)
                .toList();

        if (candidates.isEmpty()) {
            return ChatResponseDTO.builder()
                    .intent("DOCTOR_RECOMMENDATION")
                    .reply("I could not find an approved " + intent.specialization
                            + " right now. Try the Find Doctors tab and broaden filters.")
                    .suggestions(List.of("Open Find Doctors tab", "Show all specializations"))
                    .build();
        }


        
        String lines = candidates.stream().map(candidate -> {
            int exp = candidate.details.getExperienceYear() == null ? 0 : candidate.details.getExperienceYear();
            String fee = candidate.details.getConsultationFee() == null
                    ? "Fee not listed"
                    : "₹" + candidate.details.getConsultationFee();
            String clinic = candidate.details.getClinicAddress() == null || candidate.details.getClinicAddress().isBlank()
                    ? "Clinic address not listed"
                    : candidate.details.getClinicAddress();
            return "- Dr. " + candidate.user.getName() + " | " + exp + " yrs | " + fee + " | " + clinic;
        }).collect(Collectors.joining("\n"));

        String reply = "Best matches for " + intent.conditionLabel + " (" + intent.specialization + "):\n" + lines
                + "\n\nThis is guidance, not a medical diagnosis.";

        return ChatResponseDTO.builder()
                .intent("DOCTOR_RECOMMENDATION")
                .reply(reply)
                .suggestions(List.of("Open Find Doctors tab", "Book appointment", "Show upcoming appointments"))
                .build();
    }

    private DoctorRecommendationIntent detectDoctorIntent(String normalizedMessage) {
        boolean doctorQuery = containsAny(normalizedMessage,
                "best doctor", "doctor for", "specialist for", "which doctor", "find doctor", "recommend doctor");
        Map<String, String> keywordToSpecialization = buildConditionSpecializationMap();

        String matchedCondition = null;
        String matchedSpecialization = null;
        for (Map.Entry<String, String> entry : keywordToSpecialization.entrySet()) {
            if (normalizedMessage.contains(entry.getKey())) {
                matchedCondition = entry.getKey();
                matchedSpecialization = entry.getValue();
                break;
            }
        }

        if (!doctorQuery && matchedSpecialization == null) {
            return null;
        }

        if (matchedSpecialization == null) {
            if (normalizedMessage.contains("heart")) matchedSpecialization = "Cardio";
            else if (normalizedMessage.contains("skin")) matchedSpecialization = "Dermato";
            else if (normalizedMessage.contains("child") || normalizedMessage.contains("kids")) matchedSpecialization = "Pediatric";
            else if (normalizedMessage.contains("brain") || normalizedMessage.contains("neuro")) matchedSpecialization = "Neuro";
            else matchedSpecialization = "General";
            matchedCondition = "your query";
        }

        return new DoctorRecommendationIntent(matchedSpecialization, matchedCondition);
    }

    private Map<String, String> buildConditionSpecializationMap() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("diabetes", "Endocrin");
        map.put("thyroid", "Endocrin");
        map.put("blood pressure", "Cardio");
        map.put("hypertension", "Cardio");
        map.put("chest pain", "Cardio");
        map.put("heart", "Cardio");
        map.put("migraine", "Neuro");
        map.put("seizure", "Neuro");
        map.put("epilepsy", "Neuro");
        map.put("skin", "Dermato");
        map.put("acne", "Dermato");
        map.put("eczema", "Dermato");
        map.put("psoriasis", "Dermato");
        map.put("pregnancy", "Gyne");
        map.put("period", "Gyne");
        map.put("women health", "Gyne");
        map.put("baby", "Pediatric");
        map.put("child", "Pediatric");
        map.put("fever in child", "Pediatric");
        map.put("joint pain", "Ortho");
        map.put("fracture", "Ortho");
        map.put("back pain", "Ortho");
        map.put("tooth", "Dental");
        map.put("gum", "Dental");
        map.put("depression", "Psych");
        map.put("anxiety", "Psych");
        map.put("stress", "Psych");
        map.put("stomach", "Gastro");
        map.put("gastric", "Gastro");
        map.put("liver", "Gastro");
        map.put("kidney", "Nephro");
        map.put("urine", "Uro");
        map.put("eye", "Ophthal");
        map.put("vision", "Ophthal");
        map.put("ear", "ENT");
        map.put("nose", "ENT");
        map.put("throat", "ENT");
        return map;
    }

    private record DoctorRecommendationIntent(String specialization, String conditionLabel) {}

    private record DoctorCandidate(User user, DoctorDetails details, String specialization) {}
}

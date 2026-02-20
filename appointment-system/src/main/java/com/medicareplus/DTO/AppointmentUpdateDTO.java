package com.medicareplus.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.medicareplus.Models.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentUpdateDTO {
    
    // Fields that can be updated
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;
    private String symptoms;
    private String notes;
    private Double consultationFee;
    private String prescription;
    private String diagnosis;
    private LocalDate followUpDate;
    private String videoLink;
    private String meetingId;
    private Integer rating;
    private String feedback;
    private String cancellationReason;
    
    // Status update
    private AppointmentStatus status;
    
    // Validation methods
    public boolean hasDateUpdate() {
        return appointmentDate != null;
    }
    
    public boolean hasTimeUpdate() {
        return appointmentTime != null;
    }
    
    public boolean hasReasonUpdate() {
        return reason != null && !reason.trim().isEmpty();
    }
    
    public boolean hasSymptomsUpdate() {
        return symptoms != null && !symptoms.trim().isEmpty();
    }
    
    public boolean hasNotesUpdate() {
        return notes != null && !notes.trim().isEmpty();
    }
    
    public boolean hasFeeUpdate() {
        return consultationFee != null && consultationFee > 0;
    }
    
    public boolean hasPrescriptionUpdate() {
        return prescription != null && !prescription.trim().isEmpty();
    }
    
    public boolean hasDiagnosisUpdate() {
        return diagnosis != null && !diagnosis.trim().isEmpty();
    }
    
    public boolean hasFollowUpDateUpdate() {
        return followUpDate != null;
    }
    
    public boolean hasVideoLinkUpdate() {
        return videoLink != null && !videoLink.trim().isEmpty();
    }
    
    public boolean hasMeetingIdUpdate() {
        return meetingId != null && !meetingId.trim().isEmpty();
    }
    
    public boolean hasRatingUpdate() {
        return rating != null && rating >= 1 && rating <= 5;
    }
    
    public boolean hasFeedbackUpdate() {
        return feedback != null && !feedback.trim().isEmpty();
    }
    
    public boolean hasCancellationReason() {
        return cancellationReason != null && !cancellationReason.trim().isEmpty();
    }
    
    public boolean hasStatusUpdate() {
        return status != null;
    }
}
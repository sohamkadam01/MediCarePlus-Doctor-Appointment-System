package com.medicareplus.Controller;

import com.medicareplus.Models.DoctorAvailability;
import com.medicareplus.Service.DoctorAvailabilityService;
import com.medicareplus.Service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors/availability")
@CrossOrigin("*")
@RequiredArgsConstructor
@Validated
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;
    private final UserService userService;

    private Integer getCurrentDoctorId() {
        return resolveCurrentUser().getId();
    }

    private com.medicareplus.Models.User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            return userService.getUserByEmail(username);
        } catch (RuntimeException ex) {
            return userService.getUserByPhone(username);
        }
    }

    @PostMapping("/daily")
    public ResponseEntity<?> setDailyAvailability(@Valid @RequestBody DailyAvailabilityRequest request) {
        try {
            Integer doctorId = getCurrentDoctorId();
            List<DoctorAvailability> created = doctorAvailabilityService.setDailyAvailability(
                    doctorId, request.getDate(), request.getStartTime(), request.getEndTime());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/recurring")
    public ResponseEntity<?> setRecurringAvailability(@Valid @RequestBody RecurringAvailabilityRequest request) {
        try {
            Integer doctorId = getCurrentDoctorId();
            LocalDate start = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
            int slotsCreated = doctorAvailabilityService.setRecurringAvailability(
                    doctorId,
                    start,
                    request.getWeeks(),
                    request.getWeekdays(),
                    request.getStartTime(),
                    request.getEndTime()
            );
            return ResponseEntity.ok(new SuccessResponse("Recurring availability updated", slotsCreated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAvailabilityForDate(@RequestParam LocalDate date) {
        try {
            Integer doctorId = getCurrentDoctorId();
            List<DoctorAvailability> slots = doctorAvailabilityService.getDoctorAvailabilityForDate(doctorId, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getAvailableSlotTimes(@RequestParam LocalDate date) {
        try {
            Integer doctorId = getCurrentDoctorId();
            List<LocalTime> slots = doctorAvailabilityService.getAvailableSlotsForDate(doctorId, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    static class DailyAvailabilityRequest {
        @NotNull
        private LocalDate date;
        @NotNull
        private LocalTime startTime;
        @NotNull
        private LocalTime endTime;

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    }

    static class RecurringAvailabilityRequest {
        private LocalDate startDate;
        @NotNull
        private Integer weeks;
        @NotNull
        private List<Integer> weekdays; // 1=Mon ... 7=Sun
        @NotNull
        private LocalTime startTime;
        @NotNull
        private LocalTime endTime;

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public Integer getWeeks() { return weeks; }
        public void setWeeks(Integer weeks) { this.weeks = weeks; }
        public List<Integer> getWeekdays() { return weekdays; }
        public void setWeekdays(List<Integer> weekdays) { this.weekdays = weekdays; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    }

    static class SuccessResponse {
        private final String message;
        private final int slotsCreated;
        private final long timestamp;

        SuccessResponse(String message, int slotsCreated) {
            this.message = message;
            this.slotsCreated = slotsCreated;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() { return message; }
        public int getSlotsCreated() { return slotsCreated; }
        public long getTimestamp() { return timestamp; }
    }

    static class ErrorResponse {
        private final String error;
        private final long timestamp;

        ErrorResponse(String message) {
            this.error = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getError() { return error; }
        public long getTimestamp() { return timestamp; }
    }
}

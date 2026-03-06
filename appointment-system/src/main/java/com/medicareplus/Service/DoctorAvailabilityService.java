package com.medicareplus.Service;

import com.medicareplus.Models.DoctorAvailability;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.DoctorAvailabilityRepository;
import com.medicareplus.Repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<DoctorAvailability> setDailyAvailability(Integer doctorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        User doctor = validateDoctor(doctorId);
        validateTimeRange(startTime, endTime);

        doctorAvailabilityRepository.deleteByDoctorIdAndAvailableDate(doctorId, date);
        return doctorAvailabilityRepository.saveAll(buildSlotsForDate(doctor, date, startTime, endTime));
    }

    @Transactional
    public int setRecurringAvailability(
            Integer doctorId,
            LocalDate startDate,
            int weeks,
            List<Integer> weekdays,
            LocalTime startTime,
            LocalTime endTime
    ) {
        User doctor = validateDoctor(doctorId);
        validateTimeRange(startTime, endTime);

        if (weeks <= 0 || weeks > 24) {
            throw new RuntimeException("Weeks must be between 1 and 24");
        }
        if (weekdays == null || weekdays.isEmpty()) {
            throw new RuntimeException("Select at least one weekday");
        }

        Set<Integer> validDays = new HashSet<>();
        for (Integer day : weekdays) {
            if (day == null || day < 1 || day > 7) {
                throw new RuntimeException("Weekday must be between 1 (Monday) and 7 (Sunday)");
            }
            validDays.add(day);
        }

        int totalSlots = 0;
        int totalDays = weeks * 7;
        LocalDate cursorDate = startDate;
        for (int i = 0; i < totalDays; i++) {
            int dayOfWeek = cursorDate.getDayOfWeek().getValue();
            if (validDays.contains(dayOfWeek)) {
                doctorAvailabilityRepository.deleteByDoctorIdAndAvailableDate(doctorId, cursorDate);
                List<DoctorAvailability> created = doctorAvailabilityRepository.saveAll(
                        buildSlotsForDate(doctor, cursorDate, startTime, endTime)
                );
                totalSlots += created.size();
            }
            cursorDate = cursorDate.plusDays(1);
        }

        return totalSlots;
    }

    public List<DoctorAvailability> getDoctorAvailabilityForDate(Integer doctorId, LocalDate date) {
        return doctorAvailabilityRepository.findByDoctorIdAndAvailableDateOrderByStartTimeAsc(doctorId, date);
    }

    public List<LocalTime> getAvailableSlotsForDate(Integer doctorId, LocalDate date) {
        return doctorAvailabilityRepository
                .findByDoctorIdAndAvailableDateAndBookedFalseOrderByStartTimeAsc(doctorId, date)
                .stream()
                .map(DoctorAvailability::getStartTime)
                .toList();
    }

    public List<LocalDate> getAvailableDatesForDoctor(Integer doctorId, LocalDate fromDate, int days) {
        if (days <= 0) {
            return List.of();
        }
        LocalDate toDate = fromDate.plusDays(days - 1L);
        return doctorAvailabilityRepository.findDistinctAvailableDates(doctorId, fromDate, toDate);
    }

    public boolean hasConfiguredAvailability(Integer doctorId) {
        return doctorAvailabilityRepository.existsByDoctorId(doctorId);
    }

    @Transactional
    public void markSlotBooked(Integer doctorId, LocalDate date, LocalTime startTime) {
        DoctorAvailability slot = doctorAvailabilityRepository
                .findByDoctorIdAndAvailableDateAndStartTime(doctorId, date, startTime)
                .orElseThrow(() -> new RuntimeException("Doctor slot not found"));

        if (slot.isBooked()) {
            throw new RuntimeException("Selected slot is already booked");
        }

        slot.setBooked(true);
        doctorAvailabilityRepository.save(slot);
    }

    @Transactional
    public boolean markSlotBookedIfExists(Integer doctorId, LocalDate date, LocalTime startTime) {
        return doctorAvailabilityRepository
                .findByDoctorIdAndAvailableDateAndStartTime(doctorId, date, startTime)
                .map(slot -> {
                    if (slot.isBooked()) {
                        throw new RuntimeException("Selected slot is already booked");
                    }
                    slot.setBooked(true);
                    doctorAvailabilityRepository.save(slot);
                    return true;
                })
                .orElse(false);
    }

    private User validateDoctor(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new RuntimeException("User is not a doctor");
        }

        if (doctor.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Doctor is not active");
        }

        return doctor;
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }
    }

    private List<DoctorAvailability> buildSlotsForDate(User doctor, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<DoctorAvailability> slots = new ArrayList<>();
        LocalTime cursor = startTime;
        while (cursor.plusMinutes(30).compareTo(endTime) <= 0) {
            DoctorAvailability slot = new DoctorAvailability();
            slot.setDoctor(doctor);
            slot.setAvailableDate(date);
            slot.setStartTime(cursor);
            slot.setEndTime(cursor.plusMinutes(30));
            slot.setBooked(false);
            slots.add(slot);
            cursor = cursor.plusMinutes(30);
        }
        return slots;
    }
}

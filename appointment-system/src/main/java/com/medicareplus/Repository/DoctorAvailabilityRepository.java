package com.medicareplus.Repository;

import com.medicareplus.Models.DoctorAvailability;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Integer> {

    boolean existsByDoctorId(Integer doctorId);

    List<DoctorAvailability> findByDoctorIdAndAvailableDateOrderByStartTimeAsc(Integer doctorId, LocalDate availableDate);

    List<DoctorAvailability> findByDoctorIdAndAvailableDateAndBookedFalseOrderByStartTimeAsc(Integer doctorId, LocalDate availableDate);

    Optional<DoctorAvailability> findByDoctorIdAndAvailableDateAndStartTime(Integer doctorId, LocalDate availableDate, LocalTime startTime);

    void deleteByDoctorIdAndAvailableDate(Integer doctorId, LocalDate availableDate);

    @Query("""
            SELECT DISTINCT da.availableDate
            FROM DoctorAvailability da
            WHERE da.doctor.id = :doctorId
              AND da.booked = false
              AND da.availableDate BETWEEN :fromDate AND :toDate
            ORDER BY da.availableDate ASC
            """)
    List<LocalDate> findDistinctAvailableDates(
            @Param("doctorId") Integer doctorId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}

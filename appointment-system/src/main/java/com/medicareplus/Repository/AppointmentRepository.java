package com.medicareplus.Repository;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Models.AppointmentStatus;
import com.medicareplus.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find by patient
    List<Appointment> findByPatientOrderByAppointmentDateDescAppointmentTimeDesc(User patient);
    
    // Find by doctor
    List<Appointment> findByDoctorOrderByAppointmentDateDescAppointmentTimeDesc(User doctor);
    
    // Find upcoming appointments for patient
    @Query("SELECT a FROM Appointment a WHERE a.patient = :patient AND a.appointmentDate >= CURRENT_DATE AND a.status NOT IN ('CANCELLED', 'COMPLETED') ORDER BY a.appointmentDate ASC, a.appointmentTime ASC")
    List<Appointment> findUpcomingByPatient(@Param("patient") User patient);
    
    // Find past appointments for patient
    @Query("SELECT a FROM Appointment a WHERE a.patient = :patient AND (a.appointmentDate < CURRENT_DATE OR a.status = 'COMPLETED') ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    List<Appointment> findPastByPatient(@Param("patient") User patient);
    
    // Find upcoming appointments for doctor
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate >= CURRENT_DATE AND a.status NOT IN ('CANCELLED', 'COMPLETED') ORDER BY a.appointmentDate ASC, a.appointmentTime ASC")
    List<Appointment> findUpcomingByDoctor(@Param("doctor") User doctor);
    
    // Find past appointments for doctor
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND (a.appointmentDate < CURRENT_DATE OR a.status = 'COMPLETED') ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    List<Appointment> findPastByDoctor(@Param("doctor") User doctor);
    
    // Find today's appointments for doctor
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = CURRENT_DATE ORDER BY a.appointmentTime ASC")
    List<Appointment> findTodayByDoctor(@Param("doctor") User doctor);
    
    // Find by date range
    List<Appointment> findByAppointmentDateBetween(LocalDate startDate, LocalDate endDate);

    // Find by created date-time range
    List<Appointment> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    // Find by status
    List<Appointment> findByStatus(AppointmentStatus status);
    
    // Find by doctor and date
    List<Appointment> findByDoctorAndAppointmentDateOrderByAppointmentTimeAsc(User doctor, LocalDate date);

    // Find by doctor and status
    List<Appointment> findByDoctorAndStatus(User doctor, AppointmentStatus status);

    long countByDoctor(User doctor);

    long countByPatient(User patient);
    
    // Check if slot is available
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date AND a.appointmentTime = :time AND a.status NOT IN ('CANCELLED')")
    long countByDoctorAndDateTime(@Param("doctor") User doctor, @Param("date") LocalDate date, @Param("time") LocalTime time);
    
    // Get appointment statistics for doctor
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.status = :status")
    long countByDoctorAndStatus(@Param("doctor") User doctor, @Param("status") AppointmentStatus status);
    
    // Get appointment statistics for patient
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patient = :patient AND a.status = :status")
    long countByPatientAndStatus(@Param("patient") User patient, @Param("status") AppointmentStatus status);
    
    // Get monthly statistics
    @Query("SELECT MONTH(a.appointmentDate), COUNT(a) FROM Appointment a WHERE YEAR(a.appointmentDate) = :year GROUP BY MONTH(a.appointmentDate)")
    List<Object[]> getMonthlyStats(@Param("year") int year);
    
    // Get revenue statistics
    @Query("SELECT SUM(a.consultationFee) FROM Appointment a WHERE a.status = 'COMPLETED' AND a.appointmentDate BETWEEN :startDate AND :endDate")
    Double getRevenueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Doctor-wise completed appointments and revenue in date range
    @Query("""
        SELECT a.doctor.id, a.doctor.name, COUNT(a), COALESCE(SUM(a.consultationFee), 0)
        FROM Appointment a
        WHERE a.status = 'COMPLETED' AND a.appointmentDate BETWEEN :startDate AND :endDate
        GROUP BY a.doctor.id, a.doctor.name
        ORDER BY COALESCE(SUM(a.consultationFee), 0) DESC
    """)
    List<Object[]> getDoctorRevenueSummary(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Monthly appointment and revenue summary in date range
    @Query("""
        SELECT YEAR(a.appointmentDate), MONTH(a.appointmentDate), COUNT(a), COALESCE(SUM(a.consultationFee), 0)
        FROM Appointment a
        WHERE a.appointmentDate BETWEEN :startDate AND :endDate
        GROUP BY YEAR(a.appointmentDate), MONTH(a.appointmentDate)
        ORDER BY YEAR(a.appointmentDate), MONTH(a.appointmentDate)
    """)
    List<Object[]> getMonthlyRevenueSummary(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("""
        SELECT a
        FROM Appointment a
        WHERE a.status = 'COMPLETED'
          AND NOT EXISTS (
              SELECT p.id FROM PaymentRecord p WHERE p.appointment = a
          )
    """)
    List<Appointment> findCompletedWithoutPaymentRecord();
    
    // Find appointments needing follow-up
    @Query("SELECT a FROM Appointment a WHERE a.followUpDate <= :date AND a.status = 'COMPLETED'")
    List<Appointment> findFollowUpNeeded(@Param("date") LocalDate date);
    
    // Find appointments by patient and date
    List<Appointment> findByPatientAndAppointmentDateOrderByAppointmentTimeAsc(User patient, LocalDate date);
    
    // Find appointments with feedback missing
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.status = 'COMPLETED' AND a.feedback IS NULL")
    List<Appointment> findCompletedWithoutFeedback(@Param("doctor") User doctor);

    @Query("""
        SELECT a
        FROM Appointment a
        WHERE a.doctor = :doctor
          AND a.status = 'COMPLETED'
          AND (a.rating IS NOT NULL OR (a.feedback IS NOT NULL AND a.feedback <> ''))
        ORDER BY a.completedAt DESC, a.updatedAt DESC, a.createdAt DESC
    """)
    List<Appointment> findCompletedReviewsByDoctor(@Param("doctor") User doctor);

    @Query("""
        SELECT COALESCE(AVG(a.rating), 0)
        FROM Appointment a
        WHERE a.doctor = :doctor
          AND a.status = 'COMPLETED'
          AND a.rating IS NOT NULL
    """)
    Double getAverageRatingByDoctor(@Param("doctor") User doctor);

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.doctor = :doctor
          AND a.status = 'COMPLETED'
          AND a.rating IS NOT NULL
    """)
    long countCompletedRatingsByDoctor(@Param("doctor") User doctor);
}


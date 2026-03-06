package com.medicareplus.Repository;

import com.medicareplus.Models.PaymentRecord;
import com.medicareplus.Models.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {

    boolean existsByAppointmentId(Long appointmentId);

    Optional<PaymentRecord> findByAppointmentId(Long appointmentId);

    List<PaymentRecord> findByDoctorIdOrderByPaidAtDesc(Integer doctorId);

    List<PaymentRecord> findByDoctorIdAndStatusOrderByPaidAtDesc(Integer doctorId, PaymentStatus status);

    List<PaymentRecord> findByDoctorIdAndStatusAndPaidAtBetweenOrderByPaidAtAsc(
            Integer doctorId,
            PaymentStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM PaymentRecord p
        WHERE p.doctor.id = :doctorId
          AND p.status = :status
          AND p.paidAt BETWEEN :start AND :end
    """)
    Double getDoctorRevenueBetween(
            @Param("doctorId") Integer doctorId,
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}

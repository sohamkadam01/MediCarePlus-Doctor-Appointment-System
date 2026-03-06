package com.medicareplus.Repository;

import com.medicareplus.Models.MessageThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {

    List<MessageThread> findByDoctorIdOrderByUpdatedAtDesc(Integer doctorId);
    List<MessageThread> findByPatientIdOrderByUpdatedAtDesc(Integer patientId);

    Optional<MessageThread> findByIdAndDoctorId(Long id, Integer doctorId);
    Optional<MessageThread> findByIdAndPatientId(Long id, Integer patientId);

    Optional<MessageThread> findByDoctorIdAndPatientId(Integer doctorId, Integer patientId);
}

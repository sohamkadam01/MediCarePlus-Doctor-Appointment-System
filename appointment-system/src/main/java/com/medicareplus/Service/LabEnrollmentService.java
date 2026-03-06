package com.medicareplus.Service;

import com.medicareplus.DTO.LabEnrollmentRequestDTO;
import com.medicareplus.DTO.LabEnrollmentResponseDTO;
import java.util.List;

public interface LabEnrollmentService {
    LabEnrollmentResponseDTO submitEnrollment(LabEnrollmentRequestDTO request);

    List<LabEnrollmentResponseDTO> getAllEnrollments();

    LabEnrollmentResponseDTO getEnrollmentById(Integer id);

    LabEnrollmentResponseDTO approveEnrollment(Integer id);

    LabEnrollmentResponseDTO rejectEnrollment(Integer id);
}

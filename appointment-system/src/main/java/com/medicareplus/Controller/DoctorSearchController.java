package com.medicareplus.Controller;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Service.DoctorDetailsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorSearchController {

    private final DoctorDetailsService doctorDetailsService;

    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<?> searchDoctors(
            @RequestParam String city,
            @RequestParam String state) {
        List<DoctorDetails> doctors = doctorDetailsService.getDoctorsNearPatient(city, state);
        List<SearchDoctorResponse> results = doctors.stream()
                .map(SearchDoctorResponse::from)
                .toList();
        return ResponseEntity.ok(results);
    }

    static class SearchDoctorResponse {
        private Integer id;
        private Integer userId;
        private String name;
        private Long specializationId;
        private String specializationName;
        private Integer experienceYear;
        private String clinicAddress;
        private String qualification;
        private String bio;
        private String city;
        private String state;
        private BigDecimal consultationFee;
        private LocalTime availabilityStartTime;
        private LocalTime availabilityEndTime;
        private boolean approved;
        private String licenseCertificateUrl;

        static SearchDoctorResponse from(DoctorDetails details) {
            SearchDoctorResponse dto = new SearchDoctorResponse();
            dto.id = details.getId();
            dto.userId = details.getUser() != null ? details.getUser().getId() : null;
            dto.name = details.getUser() != null ? details.getUser().getName() : null;
            dto.specializationId = details.getSpecializationId();
            dto.specializationName = details.getSpecializationName();
            dto.experienceYear = details.getExperienceYear();
            dto.clinicAddress = details.getClinicAddress();
            dto.qualification = details.getQualification();
            dto.bio = details.getBio();
            dto.city = details.getCity();
            dto.state = details.getState();
            dto.consultationFee = details.getConsultationFee();
            dto.availabilityStartTime = details.getAvailabilityStartTime();
            dto.availabilityEndTime = details.getAvailabilityEndTime();
            dto.approved = details.isApproved();
            dto.licenseCertificateUrl = details.getLicenseCertificateUrl();
            return dto;
        }

        public Integer getId() { return id; }
        public Integer getUserId() { return userId; }
        public String getName() { return name; }
        public Long getSpecializationId() { return specializationId; }
        public String getSpecializationName() { return specializationName; }
        public Integer getExperienceYear() { return experienceYear; }
        public String getClinicAddress() { return clinicAddress; }
        public String getQualification() { return qualification; }
        public String getBio() { return bio; }
        public String getCity() { return city; }
        public String getState() { return state; }
        public BigDecimal getConsultationFee() { return consultationFee; }
        public LocalTime getAvailabilityStartTime() { return availabilityStartTime; }
        public LocalTime getAvailabilityEndTime() { return availabilityEndTime; }
        public boolean isApproved() { return approved; }
        public String getLicenseCertificateUrl() { return licenseCertificateUrl; }
    }
}

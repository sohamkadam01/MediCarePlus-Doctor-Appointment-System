package com.medicareplus.Service;

import com.medicareplus.DTO.LabEnrollmentRequestDTO;
import com.medicareplus.DTO.LabEnrollmentResponseDTO;
import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabEnrollmentApplication;
import com.medicareplus.Models.LabEnrollmentStatus;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.LabRepository;
import com.medicareplus.Repository.LabEnrollmentRepository;
import com.medicareplus.Repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LabEnrollmentServiceImpl implements LabEnrollmentService {
    private static final String LAB_ENROLLMENT_DIR = "lab-enrollments";

    private final LabEnrollmentRepository labEnrollmentRepository;
    private final UserRepository userRepository;
    private final LabRepository labRepository;
    private final Path uploadRoot;

    public LabEnrollmentServiceImpl(
            LabEnrollmentRepository labEnrollmentRepository,
            UserRepository userRepository,
            LabRepository labRepository,
            @Value("${app.upload.dir}") String uploadDir) {
        this.labEnrollmentRepository = labEnrollmentRepository;
        this.userRepository = userRepository;
        this.labRepository = labRepository;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public LabEnrollmentResponseDTO submitEnrollment(LabEnrollmentRequestDTO request) {
        LabEnrollmentApplication entity = new LabEnrollmentApplication();
        mapRequest(entity, request);
        entity.setStatus(LabEnrollmentStatus.PENDING);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return toResponse(labEnrollmentRepository.save(entity));
    }

    @Override
    public List<LabEnrollmentResponseDTO> getAllEnrollments() {
        return labEnrollmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LabEnrollmentResponseDTO getEnrollmentById(Integer id) {
        LabEnrollmentApplication entity = labEnrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab enrollment not found"));
        return toResponse(entity);
    }

    @Override
    public LabEnrollmentResponseDTO approveEnrollment(Integer id) {
        LabEnrollmentApplication entity = labEnrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab enrollment not found"));
        entity.setStatus(LabEnrollmentStatus.APPROVED);
        entity.setUpdatedAt(LocalDateTime.now());
        ensureLabUserAndRecord(entity);
        return toResponse(labEnrollmentRepository.save(entity));
    }

    @Override
    public LabEnrollmentResponseDTO rejectEnrollment(Integer id) {
        LabEnrollmentApplication entity = labEnrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab enrollment not found"));
        entity.setStatus(LabEnrollmentStatus.REJECTED);
        entity.setUpdatedAt(LocalDateTime.now());
        return toResponse(labEnrollmentRepository.save(entity));
    }

    private void ensureLabUserAndRecord(LabEnrollmentApplication entity) {
        if (entity.getEmail() == null || entity.getEmail().isBlank()) {
            return;
        }

        User user = userRepository.findByEmail(entity.getEmail())
                .orElseThrow(() -> new RuntimeException("Lab user not registered"));

        if (user.getRole() != UserRole.LAB) {
            user.setRole(UserRole.LAB);
        }
        user.setStatus(UserStatus.ACTIVE);
        user.setVerified(true);
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(entity.getLabName());
        }
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(entity.getPhone());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        Lab lab = labRepository.findByUserId(user.getId()).orElseGet(Lab::new);
        lab.setUserId(user.getId());
        lab.setName(entity.getLabName());
        lab.setAddress(String.format("%s, %s, %s %s",
                nullToEmpty(entity.getAddress()),
                nullToEmpty(entity.getCity()),
                nullToEmpty(entity.getState()),
                nullToEmpty(entity.getPincode())).replaceAll("\\s+,", ",").trim());
        lab.setContact(entity.getPhone());
        lab.setEmail(entity.getEmail());
        lab.setRegistrationNumber(entity.getRegistrationNumber());
        lab.setLabType(entity.getLabType());
        lab.setWebsite(entity.getWebsite());
        lab.setYearEstablished(entity.getYearEstablished());
        lab.setHomeCollection(entity.isHomeCollection());
        lab.setEmergencyServices(entity.isEmergencyServices());
        lab.setReportTurnaround(entity.getReportTurnaround());
        lab.setLicenseDocPath(entity.getLicenseDocPath());
        lab.setLogoPath(entity.getLogoPath());
        lab.setStatus(LabEnrollmentStatus.APPROVED);
        labRepository.save(lab);
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private void mapRequest(LabEnrollmentApplication entity, LabEnrollmentRequestDTO request) {
        entity.setLabName(request.getLabName());
        entity.setRegistrationNumber(request.getRegistrationNumber());
        entity.setYearEstablished(request.getYearEstablished());
        entity.setLabType(request.getLabType());
        entity.setWebsite(request.getWebsite());
        entity.setEmail(request.getEmail());
        entity.setPhone(request.getPhone());
        entity.setAlternatePhone(request.getAlternatePhone());
        entity.setAddress(request.getAddress());
        entity.setCity(request.getCity());
        entity.setState(request.getState());
        entity.setPincode(request.getPincode());
        entity.setNablAccredited(request.isNablAccredited());
        entity.setIsoCertified(request.isIsoCertified());
        entity.setCapAccredited(request.isCapAccredited());
        entity.setOtherAccreditations(request.getOtherAccreditations());
        entity.setTestCategories(joinList(request.getTestCategories()));
        entity.setHomeCollection(request.isHomeCollection());
        entity.setEmergencyServices(request.isEmergencyServices());
        entity.setReportTurnaround(request.getReportTurnaround());
        entity.setContactPersonName(request.getContactPersonName());
        entity.setContactPersonDesignation(request.getContactPersonDesignation());
        entity.setContactPersonEmail(request.getContactPersonEmail());
        entity.setContactPersonPhone(request.getContactPersonPhone());
        entity.setLicenseDocPath(storeFile(request.getLicenseDoc(), "license"));
        entity.setAccreditationDocPaths(joinList(storeFiles(request.getAccreditationDocs(), "accreditations")));
        entity.setLogoPath(storeFile(request.getLogo(), "logos"));
    }

    private String storeFile(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String cleanedName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "-" + cleanedName;
        Path targetDir = uploadRoot.resolve(LAB_ENROLLMENT_DIR).resolve(subDir);
        try {
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return targetPath.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + cleanedName);
        }
    }

    private List<String> storeFiles(List<MultipartFile> files, String subDir) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }
        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> storeFile(file, subDir))
                .collect(Collectors.toList());
    }

    private String joinList(List<String> items) {
        if (items == null || items.isEmpty()) {
            return null;
        }
        return String.join(",", items);
    }

    private List<String> splitList(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        return List.of(raw.split("\\s*,\\s*"));
    }

    private LabEnrollmentResponseDTO toResponse(LabEnrollmentApplication entity) {
        List<String> testCategories = splitList(entity.getTestCategories());
        List<String> accreditationDocs = splitList(entity.getAccreditationDocPaths());
        return LabEnrollmentResponseDTO.builder()
                .id(entity.getId())
                .labName(entity.getLabName())
                .registrationNumber(entity.getRegistrationNumber())
                .yearEstablished(entity.getYearEstablished())
                .labType(entity.getLabType())
                .website(entity.getWebsite())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .alternatePhone(entity.getAlternatePhone())
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .nablAccredited(entity.isNablAccredited())
                .isoCertified(entity.isIsoCertified())
                .capAccredited(entity.isCapAccredited())
                .otherAccreditations(entity.getOtherAccreditations())
                .testCategories(testCategories)
                .homeCollection(entity.isHomeCollection())
                .emergencyServices(entity.isEmergencyServices())
                .reportTurnaround(entity.getReportTurnaround())
                .licenseDocPath(entity.getLicenseDocPath())
                .accreditationDocPaths(accreditationDocs)
                .logoPath(entity.getLogoPath())
                .contactPersonName(entity.getContactPersonName())
                .contactPersonDesignation(entity.getContactPersonDesignation())
                .contactPersonEmail(entity.getContactPersonEmail())
                .contactPersonPhone(entity.getContactPersonPhone())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

package com.medicareplus.Config;

import com.medicareplus.Models.Lab;
import com.medicareplus.Models.LabEnrollmentApplication;
import com.medicareplus.Models.LabEnrollmentStatus;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.LabEnrollmentRepository;
import com.medicareplus.Repository.LabRepository;
import com.medicareplus.Repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class LabSeedInitializer {

    private final UserRepository userRepository;
    private final LabRepository labRepository;
    private final LabEnrollmentRepository labEnrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public LabSeedInitializer(
            UserRepository userRepository,
            LabRepository labRepository,
            LabEnrollmentRepository labEnrollmentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.labRepository = labRepository;
        this.labEnrollmentRepository = labEnrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedLabs() {
        List<String> cities = new ArrayList<>();
        for (int i = 0; i < 5; i++) cities.add("Pune");
        for (int i = 0; i < 5; i++) cities.add("Mumbai");
        for (int i = 0; i < 4; i++) cities.add("Nagpur");

        String[] puneAreas = {"Koregaon Park", "Aundh", "Kothrud", "Viman Nagar", "Hinjewadi"};
        String[] mumbaiAreas = {"Andheri West", "Bandra", "Powai", "Dadar", "Borivali"};
        String[] nagpurAreas = {"Dharampeth", "Sadar", "Civil Lines", "Trimurti Nagar"};

        String[] labTypes = {"Pathology", "Radiology", "Multi-specialty", "Diagnostic Center"};
        String[] testCategories = {
                "Hematology, Metabolic, Cardiology",
                "Imaging, Radiology, Ultrasound",
                "General Health, Thyroid, Diabetes",
                "Packages, Preventive, Nutrition"
        };

        int created = 0;
        for (int i = 0; i < cities.size(); i++) {
            String email = String.format("seed.lab%02d@medicareplus.com", i + 1);
            if (userRepository.existsByEmail(email)
                    || labEnrollmentRepository.findFirstByEmailOrderByUpdatedAtDesc(email).isPresent()
                    || labRepository.findByEmail(email).isPresent()) {
                continue;
            }

            User labUser = new User();
            labUser.setName("CityCare Lab " + (i + 1));
            labUser.setEmail(email);
            labUser.setPassword(passwordEncoder.encode("123456"));
            labUser.setPhone(String.valueOf(8000000001L + i));
            labUser.setRole(UserRole.LAB);
            labUser.setStatus(UserStatus.ACTIVE);
            labUser.setVerified(true);
            userRepository.save(labUser);

            String city = cities.get(i);
            String area;
            if ("Pune".equals(city)) {
                area = puneAreas[i % puneAreas.length];
            } else if ("Mumbai".equals(city)) {
                area = mumbaiAreas[i % mumbaiAreas.length];
            } else {
                area = nagpurAreas[i % nagpurAreas.length];
            }

            String address = area + " Diagnostic Hub, " + city;
            String pincode = String.valueOf(411001 + i);

            LabEnrollmentApplication enrollment = new LabEnrollmentApplication();
            enrollment.setLabName("CityCare Diagnostics " + (i + 1));
            enrollment.setRegistrationNumber("LAB-REG-" + (1000 + i));
            enrollment.setYearEstablished(2005 + (i % 15));
            enrollment.setLabType(labTypes[i % labTypes.length]);
            enrollment.setWebsite("https://citycarelabs.example.com/" + (i + 1));
            enrollment.setEmail(email);
            enrollment.setPhone(String.valueOf(9005000001L + i));
            enrollment.setAddress(address);
            enrollment.setCity(city);
            enrollment.setState("Maharashtra");
            enrollment.setPincode(pincode);
            enrollment.setNablAccredited(i % 2 == 0);
            enrollment.setIsoCertified(i % 3 == 0);
            enrollment.setCapAccredited(i % 4 == 0);
            enrollment.setTestCategories(testCategories[i % testCategories.length]);
            enrollment.setHomeCollection(i % 2 == 0);
            enrollment.setEmergencyServices(i % 3 == 0);
            enrollment.setReportTurnaround(24 + (i % 3) * 12);
            enrollment.setContactPersonName("Lab Manager " + (i + 1));
            enrollment.setContactPersonDesignation("Manager");
            enrollment.setContactPersonEmail(email);
            enrollment.setContactPersonPhone(String.valueOf(9007000001L + i));
            enrollment.setStatus(LabEnrollmentStatus.APPROVED);
            labEnrollmentRepository.save(enrollment);

            Lab lab = new Lab();
            lab.setUserId(labUser.getId());
            lab.setName(enrollment.getLabName());
            lab.setAddress(address + ", " + enrollment.getState() + " " + pincode);
            lab.setContact(enrollment.getPhone());
            lab.setEmail(email);
            lab.setRegistrationNumber(enrollment.getRegistrationNumber());
            lab.setLabType(enrollment.getLabType());
            lab.setWebsite(enrollment.getWebsite());
            lab.setYearEstablished(enrollment.getYearEstablished());
            lab.setHomeCollection(enrollment.isHomeCollection());
            lab.setEmergencyServices(enrollment.isEmergencyServices());
            lab.setReportTurnaround(enrollment.getReportTurnaround());
            lab.setStatus(LabEnrollmentStatus.APPROVED);
            labRepository.save(lab);

            created++;
        }

        if (created > 0) {
            System.out.println("Seeded " + created + " labs (Pune/Mumbai/Nagpur).");
        }
    }
}

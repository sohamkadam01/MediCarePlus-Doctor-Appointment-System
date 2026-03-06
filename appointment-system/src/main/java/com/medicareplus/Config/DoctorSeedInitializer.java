package com.medicareplus.Config;

import com.medicareplus.Models.DoctorDetails;
import com.medicareplus.Models.Specializations;
import com.medicareplus.Models.User;
import com.medicareplus.Models.UserRole;
import com.medicareplus.Models.UserStatus;
import com.medicareplus.Repository.DoctorDetailsRepository;
import com.medicareplus.Repository.SpecializationsRepository;
import com.medicareplus.Repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DoctorSeedInitializer {

    private final UserRepository userRepository;
    private final DoctorDetailsRepository doctorDetailsRepository;
    private final SpecializationsRepository specializationsRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DoctorSeedInitializer(
            UserRepository userRepository,
            DoctorDetailsRepository doctorDetailsRepository,
            SpecializationsRepository specializationsRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.doctorDetailsRepository = doctorDetailsRepository;
        this.specializationsRepository = specializationsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedDoctors() {
        List<Specializations> specializations = specializationsRepository.findAll();
        if (specializations.isEmpty()) {
            System.out.println("No specializations found. Skipping doctor seed.");
            return;
        }

        List<String> cities = new ArrayList<>();
        for (int i = 0; i < 7; i++) cities.add("Pune");
        for (int i = 0; i < 7; i++) cities.add("Mumbai");
        for (int i = 0; i < 6; i++) cities.add("Nagpur");

        String[] puneAreas = {"Koregaon Park", "Aundh", "Kothrud", "Viman Nagar"};
        String[] mumbaiAreas = {"Andheri West", "Bandra", "Powai", "Dadar"};
        String[] nagpurAreas = {"Dharampeth", "Sadar", "Civil Lines", "Trimurti Nagar"};

        String[] firstNames = {
                "Aarav", "Isha", "Rohan", "Meera", "Vikram",
                "Neha", "Kabir", "Ananya", "Sahil", "Pooja"
        };
        String[] lastNames = {
                "Kulkarni", "Deshmukh", "Patil", "Sharma", "Nair",
                "Iyer", "Rao", "Joshi", "Bose", "Mehta"
        };

        for (int i = 0; i < 20; i++) {
            String email = String.format("seed.doctor%02d@medicareplus.com", i + 1);
            if (userRepository.existsByEmail(email)) {
                continue;
            }

            User doctor = new User();
            doctor.setName("Dr. " + firstNames[i % firstNames.length] + " " + lastNames[i % lastNames.length]);
            doctor.setEmail(email);
            doctor.setPassword(passwordEncoder.encode("123456"));
            doctor.setPhone(String.valueOf(9000000001L + i));
            doctor.setRole(UserRole.DOCTOR);
            doctor.setStatus(UserStatus.ACTIVE);
            doctor.setVerified(true);
            userRepository.save(doctor);

            String city = cities.get(i);
            String area;
            if ("Pune".equals(city)) {
                area = puneAreas[i % puneAreas.length];
            } else if ("Mumbai".equals(city)) {
                area = mumbaiAreas[i % mumbaiAreas.length];
            } else {
                area = nagpurAreas[i % nagpurAreas.length];
            }

            DoctorDetails details = new DoctorDetails();
            details.setUser(doctor);
            details.setSpecialization(specializations.get(i % specializations.size()));
            details.setExperienceYear(3 + (i % 15));
            details.setClinicAddress(area + " Health Clinic, " + city);
            details.setQualification("MBBS, MD");
            details.setBio("Experienced clinician focused on patient-centered care.");
            details.setCity(city);
            details.setState("Maharashtra");
            details.setConsultationFee(new BigDecimal(300 + (i % 6) * 100));
            details.setAvailabilityStartTime(LocalTime.of(9 + (i % 3), 0));
            details.setAvailabilityEndTime(LocalTime.of(17 + (i % 2), 0));
            details.setApproved(true);
            details.setLicenseCertificateUrl("https://example.com/licenses/doctor-" + (i + 1));

            doctorDetailsRepository.save(details);
        }

        System.out.println("Seeded 20 doctors (7 Pune / 7 Mumbai / 6 Nagpur).");
    }
}

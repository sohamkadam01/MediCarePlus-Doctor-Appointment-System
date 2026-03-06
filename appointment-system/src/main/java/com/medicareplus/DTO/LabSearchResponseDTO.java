package com.medicareplus.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabSearchResponseDTO {
    private Integer id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String email;
    private Double rating;
    private Boolean homeCollection;
    private Boolean emergencyServices;
    private String[] testCategories;
    private Integer reportTurnaround;
    private String labType;
    private Integer yearEstablished;
    private List<String> accreditations;
    private String distance; // Calculated field
}
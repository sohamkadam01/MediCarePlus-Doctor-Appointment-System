package com.medicareplus.DTO;

import lombok.Data;

@Data
public class LabAppointmentRequestDTO {
    private String testName;
    private Double testPrice;
    private String preparation;
    private String turnaround;

    private Integer labId;
    private String labName;
    private String labAddress;
    private String labCity;
    private String labState;
    private String labPincode;
    private String labPhone;
    private String labEmail;
    private Boolean homeCollection;
    private Boolean emergencyServices;

    private String referralType;

    private Integer patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    private Integer patientAge;
    private String patientGender;

    private Double testFee;
    private Double serviceFee;
    private Double discount;
    private Double totalAmount;

    private String bookingSource;
    private String bookingStatus;
}
